from google import genai
from typing import List, Dict, Tuple
from config import get_settings
import tiktoken


class LLMAnswerer:
    def __init__(self):
        self.settings = get_settings()
        self.client = genai.Client(api_key=self.settings.google_api_key)
        self.encoder = tiktoken.get_encoding("cl100k_base")
    
    def generate_answer(self, query: str, context_docs: List[Dict]) -> Tuple[str, List[Dict], int, int]:
        """
        Generate an answer with inline citations using Gemini.
        
        Returns:
            - answer: The generated answer with inline citations
            - citations: List of cited documents with their reference numbers
            - input_tokens: Estimated input tokens
            - output_tokens: Estimated output tokens
        """
        if not context_docs:
            return "I couldn't find relevant information in the provided documents.", [], 0, 0
        
        # Build context with numbered sources
        context = self._build_context(context_docs)
        
        # Create prompt
        prompt = self._create_prompt(query, context)
        
        # Count input tokens
        input_tokens = len(self.encoder.encode(prompt))
        
        # Generate response
        try:
            response = self.client.models.generate_content(
                model=self.settings.llm_model,
                contents=prompt
            )
            answer = response.text
            
            # Count output tokens
            output_tokens = len(self.encoder.encode(answer))
            
            # Extract citations used in the answer
            citations = self._extract_citations(answer, context_docs)
            
            return answer, citations, input_tokens, output_tokens
        except Exception as e:
            print(f"LLM error: {e}")
            return f"Error generating answer: {str(e)}", [], input_tokens, 0
    
    def _build_context(self, docs: List[Dict]) -> str:
        """Build numbered context from documents."""
        context_parts = []
        for i, doc in enumerate(docs, 1):
            source = doc.get("source", "Unknown")
            content = doc.get("content", "")
            section = doc.get("section", "")
            
            section_str = f" | Section: {section}" if section else ""
            context_parts.append(f"[{i}] Source: {source}{section_str}\n{content}\n")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, query: str, context: str) -> str:
        """Create the prompt for Gemini."""
        prompt = f"""You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc., where the numbers correspond to the source numbers in the context
3. If the context doesn't contain relevant information to answer the question, respond with: "I couldn't find relevant information in the provided documents."
4. Do NOT make up information or use knowledge outside the provided context
5. Be concise and direct in your answer
6. Use multiple citations when information comes from different sources

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""
        return prompt
    
    def _extract_citations(self, answer: str, docs: List[Dict]) -> List[Dict]:
        """Extract citation numbers from answer and map to documents."""
        import re
        
        # Find all citation numbers in the answer
        citation_numbers = set(re.findall(r'\[(\d+)\]', answer))
        
        # Map to actual documents
        citations = []
        for num_str in sorted(citation_numbers, key=int):
            num = int(num_str)
            if 1 <= num <= len(docs):
                doc = docs[num - 1]
                citations.append({
                    "number": num,
                    "source": doc.get("source", "Unknown"),
                    "section": doc.get("section", ""),
                    "content": doc.get("content", "")[:300] + "..." if len(doc.get("content", "")) > 300 else doc.get("content", "")
                })
        
        return citations
    
    def generate_answer_with_general_knowledge(self, query: str) -> Tuple[str, List[Dict], int, int]:
        """
        Generate an answer using general knowledge when documents don't contain relevant info.
        
        Returns:
            - answer: The generated answer from general knowledge
            - citations: Empty list (no citations for general knowledge)
            - input_tokens: Estimated input tokens
            - output_tokens: Estimated output tokens
        """
        # Create prompt for general knowledge
        prompt = f"""You are a helpful AI assistant. Answer the following question using your general knowledge.

INSTRUCTIONS:
1. Provide a clear, accurate answer based on your training data
2. Be concise but informative
3. If you're uncertain, acknowledge it
4. Do NOT make up information
5. Start with: "Based on general knowledge: "

QUESTION: {query}

ANSWER:"""
        
        # Count input tokens
        input_tokens = len(self.encoder.encode(prompt))
        
        # Generate response
        try:
            response = self.client.models.generate_content(
                model=self.settings.llm_model,
                contents=prompt
            )
            answer = response.text
            
            # Count output tokens
            output_tokens = len(self.encoder.encode(answer))
            
            return answer, [], input_tokens, output_tokens
        except Exception as e:
            print(f"LLM error in general knowledge: {e}")
            return f"I apologize, but I encountered an error generating an answer: {str(e)}", [], input_tokens, 0
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoder.encode(text))
