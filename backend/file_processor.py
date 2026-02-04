from PyPDF2 import PdfReader
from typing import Optional
import io


class FileProcessor:
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF file."""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT file."""
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                return file_content.decode('latin-1')
            except Exception as e:
                raise ValueError(f"Error reading text file: {str(e)}")
    
    @staticmethod
    def process_file(filename: str, file_content: bytes) -> str:
        """Process file based on extension."""
        filename_lower = filename.lower()
        
        if filename_lower.endswith('.pdf'):
            return FileProcessor.extract_text_from_pdf(file_content)
        elif filename_lower.endswith('.txt'):
            return FileProcessor.extract_text_from_txt(file_content)
        else:
            raise ValueError(f"Unsupported file type. Only PDF and TXT files are supported.")
