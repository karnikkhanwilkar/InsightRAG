from google import genai
from google.genai import types
from typing import List
from config import get_settings


class Embedder:
    def __init__(self):
        self.settings = get_settings()
        self.client = genai.Client(api_key=self.settings.google_api_key)
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using Google's embedding model.
        """
        embeddings = []
        
        # Process one at a time (new API doesn't support batch the same way)
        for text in texts:
            result = self.client.models.embed_content(
                model=self.settings.embedding_model,
                contents=[types.Content(parts=[types.Part(text=text)])],
                config=types.EmbedContentConfig(output_dimensionality=self.settings.embedding_dimension)
            )
            embeddings.append(result.embeddings[0].values)
        
        return embeddings
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a query.
        """
        result = self.client.models.embed_content(
            model=self.settings.embedding_model,
            contents=[types.Content(parts=[types.Part(text=query)])],
            config=types.EmbedContentConfig(output_dimensionality=self.settings.embedding_dimension)
        )
        
        return result.embeddings[0].values
