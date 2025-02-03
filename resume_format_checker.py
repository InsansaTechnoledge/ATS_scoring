import fitz  # PyMuPDF for PDFs
import docx  # python-docx for Word documents
import logging
import re

class ResumeFormatChecker:
    def __init__(self):
        self.bullet_patterns = [
            r"•", r"▪", r"◦", r"-", r"—", r"→", r"✔", r"✓"
        ]
        self.header_keywords = ["experience", "education", "skills", "summary", "certifications", "achievements"]

    def check_pdf_format(self, file_path):
        """Check PDF for font consistency, bullet points, and section headers"""
        try:
            doc = fitz.open(file_path)
            font_usage = {}
            bullet_count = 0
            detected_headers = set()

            for page in doc:
                text_instances = page.get_text("dict")["blocks"]
                
                for block in text_instances:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                font_name = span["font"]
                                font_usage[font_name] = font_usage.get(font_name, 0) + 1
                                
                                # Bullet point detection
                                if any(re.match(pattern, span["text"].strip()) for pattern in self.bullet_patterns):
                                    bullet_count += 1
                                
                                # Section header detection
                                if span["text"].lower().strip() in self.header_keywords:
                                    detected_headers.add(span["text"].lower().strip())

            # Determine formatting consistency
            most_used_font = max(font_usage, key=font_usage.get) if font_usage else "Unknown"

            return {
                "font_consistency": len(font_usage) == 1,
                "most_used_font": most_used_font,
                "bullet_count": bullet_count,
                "headers_found": list(detected_headers)
            }

        except Exception as e:
            logging.error(f"Error analyzing PDF formatting: {e}")
            return None

    def check_docx_format(self, file_path):
        """Check DOCX for font consistency, bullet points, and section headers"""
        try:
            doc = docx.Document(file_path)
            font_usage = {}
            bullet_count = 0
            detected_headers = set()

            for para in doc.paragraphs:
                if para.style and para.style.name:
                    font_name = para.style.name
                    font_usage[font_name] = font_usage.get(font_name, 0) + 1

                # Bullet point detection
                if any(re.match(pattern, para.text.strip()) for pattern in self.bullet_patterns):
                    bullet_count += 1

                # Section header detection
                if para.text.lower().strip() in self.header_keywords:
                    detected_headers.add(para.text.lower().strip())

            most_used_font = max(font_usage, key=font_usage.get) if font_usage else "Unknown"

            return {
                "font_consistency": len(font_usage) == 1,
                "most_used_font": most_used_font,
                "bullet_count": bullet_count,
                "headers_found": list(detected_headers)
            }

        except Exception as e:
            logging.error(f"Error analyzing DOCX formatting: {e}")
            return None

    def analyze_format(self, file_path, file_type):
        """Determine which method to use based on file type"""
        if file_type == "application/pdf":
            return self.check_pdf_format(file_path)
        elif file_type.endswith("wordprocessingml.document"):
            return self.check_docx_format(file_path)
        else:
            return None
