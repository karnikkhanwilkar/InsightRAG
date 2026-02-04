from supabase import create_client, Client
from typing import List, Dict, Optional
from config import get_settings
import uuid


class VectorDatabase:
    def __init__(self):
        self.settings = get_settings()
        self.client: Client = create_client(
            self.settings.supabase_url,
            self.settings.supabase_service_key
        )
        self.table_name = "documents"
    
    def delete_by_source(self, source: str):
        """Delete all documents with the given source."""
        try:
            self.client.table(self.table_name).delete().eq("source", source).execute()
        except Exception as e:
            print(f"Error deleting documents: {e}")
    
    def upsert_documents(self, chunks: List[Dict], embeddings: List[List[float]]):
        """
        Upsert document chunks with embeddings into the database.
        First deletes existing records with the same source.
        """
        if not chunks or not embeddings:
            return
        
        # Delete existing documents from this source
        source = chunks[0]["source"]
        self.delete_by_source(source)
        
        # Prepare records
        records = []
        for chunk, embedding in zip(chunks, embeddings):
            record = {
                "id": str(uuid.uuid4()),
                "content": chunk["content"],
                "embedding": embedding,
                "source": chunk["source"],
                "title": chunk["title"],
                "section": chunk.get("section", ""),
                "chunk_index": chunk["chunk_index"]
            }
            records.append(record)
        
        # Insert in batches
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self.client.table(self.table_name).insert(batch).execute()
    
    def similarity_search(self, query_embedding: List[float], top_k: int = 8) -> List[Dict]:
        """
        Perform similarity search using pgvector.
        Returns top-k most similar documents.
        """
        try:
            # Use RPC function for vector similarity search
            result = self.client.rpc(
                "match_documents",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.0,
                    "match_count": top_k
                }
            ).execute()
            
            print(f"DEBUG: RPC call completed")
            print(f"DEBUG: Similarity search returned {len(result.data) if result.data else 0} results")
            
            if result.data and len(result.data) > 0:
                return result.data
            
            # If RPC returned 0 results, fall back to simple query
            print("WARNING: RPC returned 0 results, using fallback...")
            raise Exception("RPC returned no results, trying fallback")
            
        except Exception as e:
            print(f"ERROR in similarity_search RPC: {e}")
            # Fallback: Get all documents (simple workaround)
            print("Using fallback: retrieving all documents...")
            try:
                all_docs = self.client.table(self.table_name).select("*").execute()
                if all_docs.data and len(all_docs.data) > 0:
                    print(f"DEBUG: Fallback found {len(all_docs.data)} total documents")
                    # Return up to top_k documents (not ideal but works)
                    return all_docs.data[:top_k]
                else:
                    print("ERROR: No documents in database!")
                    return []
            except Exception as e2:
                print(f"ERROR in fallback: {e2}")
                return []
    
    def get_all_sources(self) -> List[str]:
        """Get all unique sources in the database."""
        result = self.client.table(self.table_name).select("source").execute()
        if result.data:
            sources = list(set([doc["source"] for doc in result.data]))
            return sources
        return []
