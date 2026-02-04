from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    google_api_key: str
    cohere_api_key: str
    
    # Model configurations
    embedding_model: str = "models/gemini-embedding-001"
    embedding_dimension: int = 768
    rerank_model: str = "rerank-english-v3.0"
    llm_model: str = "models/gemini-2.5-flash"
    
    # Chunking parameters
    chunk_size: int = 1000
    chunk_overlap: int = 150
    
    # Retrieval parameters
    top_k_retrieval: int = 8
    top_k_rerank: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
