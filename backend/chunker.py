import tiktoken
from typing import List, Dict
import re


class TextChunker:
    def __init__(self, chunk_size: int = 1000, overlap: int = 150):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.encoder = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoder.encode(text))
    
    def chunk_text(self, text: str, source: str, title: str = None) -> List[Dict]:
        """
        Chunk text into overlapping segments with metadata.
        Attempts to break at semantic boundaries (paragraphs, sentences).
        """
        if not title:
            title = source
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        chunks = []
        current_chunk = ""
        current_tokens = 0
        chunk_index = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para_tokens = self.count_tokens(para)
            
            # If single paragraph exceeds chunk size, split it by sentences
            if para_tokens > self.chunk_size:
                sentences = self._split_into_sentences(para)
                
                for sentence in sentences:
                    sentence_tokens = self.count_tokens(sentence)
                    
                    if current_tokens + sentence_tokens > self.chunk_size and current_chunk:
                        # Save current chunk
                        chunks.append({
                            "content": current_chunk.strip(),
                            "source": source,
                            "title": title,
                            "section": self._extract_section(current_chunk),
                            "chunk_index": chunk_index
                        })
                        chunk_index += 1
                        
                        # Start new chunk with overlap
                        current_chunk = self._get_overlap_text(current_chunk, sentence)
                        current_tokens = self.count_tokens(current_chunk)
                    else:
                        current_chunk += " " + sentence
                        current_tokens += sentence_tokens
            else:
                # Add paragraph to current chunk
                if current_tokens + para_tokens > self.chunk_size and current_chunk:
                    # Save current chunk
                    chunks.append({
                        "content": current_chunk.strip(),
                        "source": source,
                        "title": title,
                        "section": self._extract_section(current_chunk),
                        "chunk_index": chunk_index
                    })
                    chunk_index += 1
                    
                    # Start new chunk with overlap
                    current_chunk = self._get_overlap_text(current_chunk, para)
                    current_tokens = self.count_tokens(current_chunk)
                else:
                    if current_chunk:
                        current_chunk += "\n\n" + para
                    else:
                        current_chunk = para
                    current_tokens += para_tokens
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                "content": current_chunk.strip(),
                "source": source,
                "title": title,
                "section": self._extract_section(current_chunk),
                "chunk_index": chunk_index
            })
        
        return chunks
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        # Simple sentence splitter
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _get_overlap_text(self, current_chunk: str, new_text: str) -> str:
        """Get overlap text from current chunk to maintain context."""
        tokens = self.encoder.encode(current_chunk)
        if len(tokens) > self.overlap:
            overlap_tokens = tokens[-self.overlap:]
            overlap_text = self.encoder.decode(overlap_tokens)
            return overlap_text + " " + new_text
        return new_text
    
    def _extract_section(self, text: str) -> str:
        """Extract section/heading from text if available."""
        lines = text.split('\n')
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            if line and (line.isupper() or line.startswith('#')):
                return line.replace('#', '').strip()
        return ""
