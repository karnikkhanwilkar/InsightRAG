from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict
import time
from datetime import datetime
from supabase import create_client

from chunker import TextChunker
from embedder import Embedder
from database import VectorDatabase
from reranker import Reranker
from llm import LLMAnswerer
from file_processor import FileProcessor
from config import get_settings

app = FastAPI(title="RAG Application API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
settings = get_settings()
chunker = TextChunker(chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
embedder = Embedder()
db = VectorDatabase()
reranker = Reranker()
llm = LLMAnswerer()
file_processor = FileProcessor()
security = HTTPBearer()

# Supabase client for auth verification (initialized once, not per-request)
_supabase_auth_client = create_client(settings.supabase_url, settings.supabase_service_key)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Verify the Supabase JWT and extract user info.
    Returns dict with 'sub' (user_id) and 'email'.
    """
    token = credentials.credentials
    try:
        user_response = _supabase_auth_client.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user = user_response.user
        return {
            "sub": str(user.id),
            "email": user.email,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


class IngestTextRequest(BaseModel):
    text: str
    source_name: Optional[str] = "pasted_text"


class QueryRequest(BaseModel):
    question: str
    source_filter: Optional[List[str]] = None


class Citation(BaseModel):
    number: int
    source: str
    section: str
    content: str


class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    latency_ms: int
    input_tokens: int
    output_tokens: int
    warning: Optional[str] = None
    credits_remaining: Optional[float] = None
    credits_deducted: Optional[float] = None


@app.get("/")
async def root():
    return {
        "message": "RAG Application API",
        "version": "2.0.0",
        "endpoints": {
            "POST /ingest": "Ingest text or file (auth required)",
            "POST /query": "Query the knowledge base (auth required)",
            "GET /sources": "Get user's sources (auth required)",
            "GET /auth/profile": "Get user profile (auth required)",
            "GET /auth/credits-history": "Get credit history (auth required)",
        }
    }


@app.post("/ingest")
async def ingest(
    text: Optional[str] = Form(None),
    source_name: Optional[str] = Form("pasted_text"),
    file: Optional[UploadFile] = File(None),
    current_user: Dict = Depends(get_current_user)
):
    """
    Ingest text or file into the vector database.
    Requires authentication. File size limited to 10 MB.
    """
    start_time = time.time()
    user_id = current_user["sub"]

    try:
        if file:
            file_content = await file.read()
            if len(file_content) > settings.max_file_size_bytes:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds {settings.max_file_size_bytes // (1024*1024)} MB limit"
                )

            content = file_processor.process_file(file.filename, file_content)
            source = file.filename
        elif text:
            content = text
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            source = f"pasted_text_{timestamp}"
        else:
            raise HTTPException(status_code=400, detail="Either text or file must be provided")

        if not content or len(content.strip()) < 10:
            raise HTTPException(status_code=400, detail="Content is too short or empty")

        chunks = chunker.chunk_text(content, source=source, title=source)

        if not chunks:
            raise HTTPException(status_code=400, detail="No chunks generated from content")

        texts = [chunk["content"] for chunk in chunks]
        embeddings = embedder.embed_texts(texts)

        db.upsert_documents(chunks, embeddings, user_id)

        elapsed_ms = int((time.time() - start_time) * 1000)

        return {
            "message": "Content ingested successfully",
            "source": source,
            "chunks_created": len(chunks),
            "latency_ms": elapsed_ms
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest, current_user: Dict = Depends(get_current_user)):
    """
    Query the knowledge base and get an answer with citations.
    Requires authentication. Deducts credits based on tokens used.
    """
    start_time = time.time()
    user_id = current_user["sub"]

    try:
        if not request.question or len(request.question.strip()) < 3:
            raise HTTPException(status_code=400, detail="Question is too short")

        # Check credits (with auto-refresh after 48 hours)
        profile = db.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        if profile["credits_remaining"] <= 0:
            raise HTTPException(
                status_code=403,
                detail="No credits remaining. Credits refresh every 48 hours."
            )

        print(f"\n=== QUERY DEBUG ===")
        print(f"User: {current_user['email']}")
        print(f"Credits remaining: {profile['credits_remaining']}")
        print(f"Question: {request.question}")

        query_embedding = embedder.embed_query(request.question)

        retrieved_docs = db.similarity_search(
            query_embedding,
            user_id=user_id,
            top_k=settings.top_k_retrieval,
            source_filter=request.source_filter
        )
        print(f"Retrieved {len(retrieved_docs)} documents for user")

        if not retrieved_docs:
            all_sources = db.get_all_sources(user_id)
            print(f"Available sources for user: {all_sources}")
            return QueryResponse(
                answer="I couldn't find relevant information in your documents. Please upload documents first.",
                citations=[],
                latency_ms=int((time.time() - start_time) * 1000),
                input_tokens=0,
                output_tokens=0,
                credits_remaining=profile["credits_remaining"],
                credits_deducted=0
            )

        reranked_docs = reranker.rerank(
            request.question,
            retrieved_docs,
            top_k=settings.top_k_rerank
        )

        answer, citations, input_tokens, output_tokens = llm.generate_answer(
            request.question,
            reranked_docs
        )

        total_tokens = input_tokens + output_tokens
        elapsed_ms = int((time.time() - start_time) * 1000)

        credit_result = db.deduct_credits(user_id, total_tokens, request.question)

        no_info_indicators = [
            "couldn't find relevant information",
            "don't have information",
            "no information available",
            "not mentioned in the documents"
        ]

        answer_lower = answer.lower()
        has_no_info = any(indicator in answer_lower for indicator in no_info_indicators)

        warning = None
        if has_no_info:
            print("Context not relevant. Attempting general knowledge answer...")
            general_answer, _, gen_input_tokens, gen_output_tokens = llm.generate_answer_with_general_knowledge(
                request.question
            )

            gen_total_tokens = gen_input_tokens + gen_output_tokens
            if gen_total_tokens > 0:
                gen_credit_result = db.deduct_credits(user_id, gen_total_tokens, f"[general] {request.question}")
                credit_result["credits_remaining"] = gen_credit_result["credits_remaining"]
                credit_result["credits_deducted"] += gen_credit_result["credits_deducted"]

            warning = "⚠️ Your documents don't contain specific information about this query. This answer is generated from general AI knowledge."

            return QueryResponse(
                answer=general_answer,
                citations=citations,
                latency_ms=elapsed_ms,
                input_tokens=gen_input_tokens,
                output_tokens=gen_output_tokens,
                warning=warning,
                credits_remaining=credit_result["credits_remaining"],
                credits_deducted=credit_result["credits_deducted"]
            )

        return QueryResponse(
            answer=answer,
            citations=citations,
            latency_ms=elapsed_ms,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            warning=None,
            credits_remaining=credit_result["credits_remaining"],
            credits_deducted=credit_result["credits_deducted"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.get("/sources")
async def get_sources(current_user: Dict = Depends(get_current_user)):
    """Get all unique sources for the authenticated user."""
    try:
        sources = db.get_all_sources(current_user["sub"])
        return {"sources": sources, "count": len(sources)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sources: {str(e)}")


@app.get("/sources/details")
async def get_source_details(current_user: Dict = Depends(get_current_user)):
    """Get detailed info about each source (chunk count, dates) for the authenticated user."""
    try:
        details = db.get_source_details(current_user["sub"])
        return {"sources": details, "count": len(details)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving source details: {str(e)}")


@app.delete("/sources/{source_name}")
async def delete_source(source_name: str, current_user: Dict = Depends(get_current_user)):
    """Delete all chunks for a specific source for the authenticated user."""
    user_id = current_user["sub"]
    try:
        # Verify the source exists for this user
        all_sources = db.get_all_sources(user_id)
        if source_name not in all_sources:
            raise HTTPException(status_code=404, detail="Source not found")

        db.delete_by_source(source_name, user_id)
        db._update_storage_used(user_id)
        return {"message": f"Source '{source_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting source: {str(e)}")


@app.get("/auth/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """Get the authenticated user's profile including credits."""
    try:
        profile = db.get_user_profile(current_user["sub"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {
            "id": profile["id"],
            "email": profile["email"],
            "credits_remaining": round(profile["credits_remaining"], 4),
            "credits_last_refreshed_at": profile["credits_last_refreshed_at"],
            "storage_used_bytes": profile["storage_used_bytes"],
            "max_storage_bytes": profile["max_storage_bytes"],
            "created_at": profile["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/auth/credits-history")
async def get_credits_history(current_user: Dict = Depends(get_current_user)):
    """Get credit transaction history for the authenticated user."""
    try:
        history = db.get_credit_history(current_user["sub"])
        return {"transactions": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
