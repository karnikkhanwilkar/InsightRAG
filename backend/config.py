from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    google_api_key: str
    cohere_api_key: str
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
    
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
    
    # User limits
    max_file_size_bytes: int = 10485760  # 10 MB
    initial_credits: float = 5.0
    tokens_per_credit: int = 1000  # 1000 tokens = 1 credit
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
