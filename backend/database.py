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
    
    def delete_by_source(self, source: str, user_id: str):
        """Delete all documents with the given source for a specific user."""
        try:
            self.client.table(self.table_name).delete().eq("source", source).eq("user_id", user_id).execute()
        except Exception as e:
            print(f"Error deleting documents: {e}")
    
    def upsert_documents(self, chunks: List[Dict], embeddings: List[List[float]], user_id: str):
        """
        Upsert document chunks with embeddings into the database.
        First deletes existing records with the same source for this user.
        """
        if not chunks or not embeddings:
            return
        
        # Delete existing documents from this source for this user
        source = chunks[0]["source"]
        self.delete_by_source(source, user_id)
        
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
                "chunk_index": chunk["chunk_index"],
                "user_id": user_id
            }
            records.append(record)
        
        # Insert in batches
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self.client.table(self.table_name).insert(batch).execute()
        
        # Update storage used
        self._update_storage_used(user_id)
    
    def similarity_search(self, query_embedding: List[float], user_id: str, top_k: int = 8) -> List[Dict]:
        """
        Perform similarity search using pgvector, filtered to user's documents only.
        """
        try:
            result = self.client.rpc(
                "match_documents",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.0,
                    "match_count": top_k,
                    "p_user_id": user_id
                }
            ).execute()
            
            print(f"DEBUG: RPC call completed")
            print(f"DEBUG: Similarity search returned {len(result.data) if result.data else 0} results")
            
            if result.data and len(result.data) > 0:
                return result.data
            
            print("WARNING: RPC returned 0 results for user")
            return []
            
        except Exception as e:
            print(f"ERROR in similarity_search RPC: {e}")
            # Fallback: Get user's documents
            try:
                all_docs = self.client.table(self.table_name).select("*").eq("user_id", user_id).execute()
                if all_docs.data and len(all_docs.data) > 0:
                    print(f"DEBUG: Fallback found {len(all_docs.data)} documents for user")
                    return all_docs.data[:top_k]
                else:
                    print("ERROR: No documents in database for this user!")
                    return []
            except Exception as e2:
                print(f"ERROR in fallback: {e2}")
                return []
    
    def get_all_sources(self, user_id: str) -> List[str]:
        """Get all unique sources for a specific user."""
        result = self.client.table(self.table_name).select("source").eq("user_id", user_id).execute()
        if result.data:
            sources = list(set([doc["source"] for doc in result.data]))
            return sources
        return []
    
    # ---- User Profile Methods ----
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile, refreshing credits if 48 hours have passed."""
        # First refresh credits if needed via DB function
        try:
            self.client.rpc("refresh_credits_if_needed", {"p_user_id": user_id}).execute()
        except Exception as e:
            print(f"Warning: Could not refresh credits: {e}")
        
        result = self.client.table("user_profiles").select("*").eq("id", user_id).single().execute()
        return result.data if result.data else None
    
    def deduct_credits(self, user_id: str, tokens_used: int, question_preview: str) -> Dict:
        """
        Deduct credits based on tokens used. Returns updated profile info.
        Formula: credits_deducted = tokens_used / tokens_per_credit
        """
        credits_deducted = tokens_used / self.settings.tokens_per_credit
        
        # Get current credits
        profile = self.get_user_profile(user_id)
        if not profile:
            raise ValueError("User profile not found")
        
        current_credits = profile["credits_remaining"]
        new_credits = max(0, current_credits - credits_deducted)
        
        # Update credits
        self.client.table("user_profiles").update({
            "credits_remaining": new_credits
        }).eq("id", user_id).execute()
        
        # Log transaction
        self.client.table("credit_transactions").insert({
            "user_id": user_id,
            "tokens_used": tokens_used,
            "credits_deducted": round(credits_deducted, 4),
            "credits_remaining_after": round(new_credits, 4),
            "question_preview": question_preview[:100] if question_preview else ""
        }).execute()
        
        return {
            "credits_deducted": round(credits_deducted, 4),
            "credits_remaining": round(new_credits, 4)
        }
    
    def get_credit_history(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get credit transaction history for a user."""
        result = self.client.table("credit_transactions").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(limit).execute()
        return result.data if result.data else []
    
    def _update_storage_used(self, user_id: str):
        """Recalculate and update storage used for a user."""
        try:
            # Get total content size for this user's documents
            docs = self.client.table(self.table_name).select("content").eq("user_id", user_id).execute()
            total_bytes = sum(len(doc["content"].encode("utf-8")) for doc in docs.data) if docs.data else 0
            
            self.client.table("user_profiles").update({
                "storage_used_bytes": total_bytes
            }).eq("id", user_id).execute()
        except Exception as e:
            print(f"Warning: Could not update storage: {e}")
