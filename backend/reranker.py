import cohere
from typing import List, Dict
from config import get_settings


class Reranker:
    def __init__(self):
        self.settings = get_settings()
        self.client = cohere.Client(self.settings.cohere_api_key)
    
    def rerank(self, query: str, documents: List[Dict], top_k: int = 4) -> List[Dict]:
        """
        Rerank documents using Cohere's rerank-english-v3.0 model.
        """
        if not documents:
            return []
        
        # Extract text content for reranking
        texts = [doc["content"] for doc in documents]
        
        # Perform reranking
        try:
            response = self.client.rerank(
                model=self.settings.rerank_model,
                query=query,
                documents=texts,
                top_n=min(top_k, len(documents))
            )
            
            # Map reranked results back to original documents
            reranked_docs = []
            for result in response.results:
                doc = documents[result.index].copy()
                doc["relevance_score"] = result.relevance_score
                reranked_docs.append(doc)
            
            return reranked_docs
        except Exception as e:
            print(f"Reranking error: {e}")
            # Fallback: return top documents as-is
            return documents[:top_k]
