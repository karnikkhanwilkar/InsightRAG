from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import time
from datetime import datetime

from chunker import TextChunker
from embedder import Embedder
from database import VectorDatabase
from reranker import Reranker
from llm import LLMAnswerer
from file_processor import FileProcessor
from config import get_settings

app = FastAPI(title="RAG Application API", version="1.0.0")

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


class IngestTextRequest(BaseModel):
    text: str
    source_name: Optional[str] = "pasted_text"


class QueryRequest(BaseModel):
    question: str


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


@app.get("/")
async def root():
    return {
        "message": "RAG Application API",
        "version": "1.0.0",
        "endpoints": {
            "POST /ingest": "Ingest text or file",
            "POST /query": "Query the knowledge base"
        }
    }


@app.post("/ingest")
async def ingest(
    text: Optional[str] = Form(None),
    source_name: Optional[str] = Form("pasted_text"),
    file: Optional[UploadFile] = File(None)
):
    """
    Ingest text or file into the vector database.
    
    - text: Direct text input
    - source_name: Name for the source (default: "pasted_text")
    - file: Upload PDF or TXT file
    """
    start_time = time.time()
    
    try:
        # Determine content source
        if file:
            # Process uploaded file
            file_content = await file.read()
            content = file_processor.process_file(file.filename, file_content)
            source = file.filename
        elif text:
            # Use provided text with unique timestamp
            content = text
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            source = f"pasted_text_{timestamp}"
        else:
            raise HTTPException(status_code=400, detail="Either text or file must be provided")
        
        if not content or len(content.strip()) < 10:
            raise HTTPException(status_code=400, detail="Content is too short or empty")
        
        # Chunk the content
        chunks = chunker.chunk_text(content, source=source, title=source)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No chunks generated from content")
        
        # Generate embeddings
        texts = [chunk["content"] for chunk in chunks]
        embeddings = embedder.embed_texts(texts)
        
        # Store in database
        db.upsert_documents(chunks, embeddings)
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        return {
            "message": "Content ingested successfully",
            "source": source,
            "chunks_created": len(chunks),
            "latency_ms": elapsed_ms
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Query the knowledge base and get an answer with citations.
    
    - question: The question to ask
    """
    start_time = time.time()
    
    try:
        if not request.question or len(request.question.strip()) < 3:
            raise HTTPException(status_code=400, detail="Question is too short")
        
        print(f"\n=== QUERY DEBUG ===")
        print(f"Question: {request.question}")
        
        # Generate query embedding
        print("Generating query embedding...")
        query_embedding = embedder.embed_query(request.question)
        print(f"Embedding generated: {len(query_embedding)} dimensions")
        print(f"First 5 values: {query_embedding[:5]}")
        
        # Retrieve top-k documents
        print(f"Searching for top-{settings.top_k_retrieval} documents...")
        retrieved_docs = db.similarity_search(
            query_embedding,
            top_k=settings.top_k_retrieval
        )
        print(f"Retrieved {len(retrieved_docs)} documents")
        
        if not retrieved_docs:
            print("ERROR: No documents retrieved!")
            # Check if any documents exist in database
            all_sources = db.get_all_sources()
            print(f"Available sources in database: {all_sources}")
            return QueryResponse(
                answer="I couldn't find relevant information in the provided documents. Please make sure documents have been ingested first.",
                citations=[],
                latency_ms=int((time.time() - start_time) * 1000),
                input_tokens=0,
                output_tokens=0
            )
        
        # Rerank documents
        reranked_docs = reranker.rerank(
            request.question,
            retrieved_docs,
            top_k=settings.top_k_rerank
        )
        
        # Generate answer with LLM
        answer, citations, input_tokens, output_tokens = llm.generate_answer(
            request.question,
            reranked_docs
        )
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        return QueryResponse(
            answer=answer,
            citations=citations,
            latency_ms=elapsed_ms,
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.get("/sources")
async def get_sources():
    """Get all unique sources in the database."""
    try:
        sources = db.get_all_sources()
        return {"sources": sources, "count": len(sources)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sources: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
