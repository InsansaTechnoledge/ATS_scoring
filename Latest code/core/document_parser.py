import pdfplumber
import docx
# from typing import str

class DocumentParser:
    """Extract text from PDF and DOCX files"""
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from resume file"""
        if file_path.lower().endswith('.pdf'):
            return self._extract_pdf_text(file_path)
        elif file_path.lower().endswith(('.docx', '.doc')):
            return self._extract_docx_text(file_path)
        else:
            raise ValueError("Unsupported file format. Use PDF or DOCX.")
    
    def _extract_pdf_text(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
        return text.strip()
    
    def _extract_docx_text(self, docx_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = docx.Document(docx_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
        return text.strip()