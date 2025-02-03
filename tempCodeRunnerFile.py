import magic
import tkinter as tk
from tkinter import filedialog, messagebox
import fitz  # PyMuPDF
from pathlib import Path
import docx  # python-docx for Word documents
import os
import hashlib
from datetime import datetime
import json
import logging

class ATSFormatChecker:
    def __init__(self):
        self.format_scores = {
            'application/pdf': 100,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 100,  # docx
            'application/msword': 80,  # doc
            'text/plain': 70,  # txt
            'application/rtf': 60,  # rtf
        }
        
        # Initialize tkinter
        self.root = tk.Tk()
        self.root.withdraw()
        
        # Setup logging
        self.setup_logging()
        
        # Load configuration
        self.config = self.load_config()
        
        # Initialize file history
        self.history_file = 'file_history.json'
        self.load_history()

    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            filename='ats_checker.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def load_config(self):
        """Load configuration from config.json"""
        default_config = {
            'min_file_size_kb': 50,
            'max_file_size_mb': 10,
            'min_word_count': 200,
            'max_word_count': 5000,
            'required_sections': ['experience', 'education', 'skills'],
            'forbidden_characters': ['□', '■', '�', '°'],
            'max_image_percentage': 30
        }
        
        try:
            if os.path.exists('config.json'):
                with open('config.json', 'r') as f:
                    return {**default_config, **json.load(f)}
        except Exception as e:
            logging.error(f"Error loading config: {e}")
        return default_config

    def load_history(self):
        """Load file processing history"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r') as f:
                    self.history = json.load(f)
            else:
                self.history = {}
        except Exception as e:
            logging.error(f"Error loading history: {e}")
            self.history = {}

    def save_to_history(self, file_path, result):
        """Save file processing result to history"""
        file_hash = self.get_file_hash(file_path)
        self.history[file_hash] = {
            'filename': os.path.basename(file_path),
            'last_checked': datetime.now().isoformat(),
            'result': result
        }
        
        try:
            with open(self.history_file, 'w') as f:
                json.dump(self.history, f, indent=4)
        except Exception as e:
            logging.error(f"Error saving history: {e}")

    def get_file_hash(self, file_path):
        """Generate hash for file"""
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()

    def check_file_size(self, file_path):
        """Check if file size is within acceptable range"""
        file_size = os.path.getsize(file_path)
        min_size = self.config['min_file_size_kb'] * 1024
        max_size = self.config['max_file_size_mb'] * 1024 * 1024
        
        if file_size < min_size:
            return False, f"File too small (minimum {self.config['min_file_size_kb']}KB)"
        if file_size > max_size:
            return False, f"File too large (maximum {self.config['max_file_size_mb']}MB)"
        return True, "File size acceptable"

    def count_words(self, text):
        """Count words in text"""
        return len(text.split())

    def check_word_count(self, text):
        """Check if word count is within acceptable range"""
        word_count = self.count_words(text)
        if word_count < self.config['min_word_count']:
            return False, f"Too few words (minimum {self.config['min_word_count']})"
        if word_count > self.config['max_word_count']:
            return False, f"Too many words (maximum {self.config['max_word_count']})"
        return True, f"Word count acceptable ({word_count} words)"

    def check_required_sections(self, text):
        """Check for required sections in the document"""
        text_lower = text.lower()
        missing_sections = []
        for section in self.config['required_sections']:
            if section not in text_lower:
                missing_sections.append(section)
        return not missing_sections, missing_sections

    def check_forbidden_characters(self, text):
        """Check for forbidden characters that might indicate formatting issues"""
        found_chars = []
        for char in self.config['forbidden_characters']:
            if char in text:
                found_chars.append(char)
        return not found_chars, found_chars

    def get_file_type(self, file_path):
        """Determine the file type using magic library"""
        try:
            mime = magic.Magic(mime=True)
            return mime.from_file(file_path)
        except Exception as e:
            logging.error(f"Error determining file type: {e}")
            return None

    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logging.error(f"Error extracting text from DOCX: {e}")
            return None

    def is_ats_compliant_pdf(self, file_path):
        """Check if the PDF contains selectable text and analyze its structure"""
        try:
            doc = fitz.open(file_path)
            text_content = ""
            total_image_area = 0
            total_page_area = 0
            
            for page in doc:
                text_content += page.get_text()
                
                # Calculate image coverage
                image_list = page.get_images(full=True)
                page_area = page.rect.width * page.rect.height
                total_page_area += page_area
                
                for img in image_list:
                    xref = img[0]
                    image = doc.extract_image(xref)
                    if image:
                        pix = fitz.Pixmap(image["image"])
                        image_area = pix.width * pix.height
                        total_image_area += image_area
            
            doc.close()
            
            # Calculate image percentage
            if total_page_area > 0:
                image_percentage = (total_image_area / total_page_area) * 100
                if image_percentage > self.config['max_image_percentage']:
                    return False, f"Too many images ({image_percentage:.1f}% of document)"
            
            # Check for substantial text content
            if len(text_content.strip()) > 100:
                return True, "PDF is ATS-friendly"
            return False, "Insufficient text content"
            
        except Exception as e:
            logging.error(f"Error analyzing PDF: {e}")
            return None, str(e)

    def calculate_format_score(self, file_path):
        """Calculate comprehensive format compatibility score"""
        result = {
            'score': 0,
            'messages': [],
            'file_type': None,
            'word_count': 0,
            'sections_present': [],
            'sections_missing': [],
            'formatting_issues': [],
            'recommendations': []
        }

        # Check if file exists
        if not Path(file_path).exists():
            result['messages'].append("File not found.")
            return result

        # Check file size
        size_ok, size_message = self.check_file_size(file_path)
        if not size_ok:
            result['messages'].append(size_message)
            return result

        # Get file type
        file_type = self.get_file_type(file_path)
        result['file_type'] = file_type

        if file_type not in self.format_scores:
            result['messages'].append(f"Unsupported file format: {file_type}")
            result['recommendations'].append("Convert document to PDF or DOCX format")
            return result

        # Extract text based on file type
        text_content = None
        if file_type == 'application/pdf':
            is_ats_friendly, message = self.is_ats_compliant_pdf(file_path)
            if not is_ats_friendly:
                result['messages'].append(message)
                result['recommendations'].append("Convert PDF to searchable text format")
                return result
            text_content = fitz.open(file_path).get_page_text(0)
        elif file_type.endswith('wordprocessingml.document'):
            text_content = self.extract_text_from_docx(file_path)
        elif file_type == 'text/plain':
            with open(file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()

        if text_content:
            # Check word count
            word_count_ok, word_count_message = self.check_word_count(text_content)
            result['messages'].append(word_count_message)
            if not word_count_ok:
                result['recommendations'].append("Adjust document length to meet requirements")

            # Check required sections
            sections_ok, missing_sections = self.check_required_sections(text_content)
            if not sections_ok:
                result['sections_missing'] = missing_sections
                result['messages'].append(f"Missing sections: {', '.join(missing_sections)}")
                result['recommendations'].append("Add missing required sections")

            # Check for formatting issues
            format_ok, found_chars = self.check_forbidden_characters(text_content)
            if not format_ok:
                result['formatting_issues'] = found_chars
                result['messages'].append(f"Found formatting issues: {', '.join(found_chars)}")
                result['recommendations'].append("Fix formatting issues and special characters")

            # Calculate final score
            base_score = self.format_scores[file_type]
            deductions = 0
            if not word_count_ok:
                deductions += 30
            if not sections_ok:
                deductions += 20 * len(missing_sections)
            if not format_ok:
                deductions += 10 * len(found_chars)

            result['score'] = max(0, base_score - deductions)

        # Save to history
        self.save_to_history(file_path, result)

        return result

    def check_file(self):
        """Open file dialog and check format compatibility"""
        file_path = filedialog.askopenfilename(
            title="Select Resume File",
            filetypes=[
                ("All Supported Formats", "*.pdf;*.docx;*.doc;*.txt;*.rtf"),
                ("PDF Files", "*.pdf"),
                ("Word Files", "*.docx;*.doc"),
                ("Text Files", "*.txt"),
                ("RTF Files", "*.rtf")
            ]
        )

        if not file_path:
            return {
                'score': 0,
                'messages': ["No file selected."],
                'file_type': None
            }

        return self.calculate_format_score(file_path)

    def generate_report(self, result):
        """Generate a detailed report of the analysis"""
        report = [
            "=== ATS Format Check Report ===",
            f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Score: {result['score']}/100",
            f"File Type: {result['file_type']}",
            "\nMessages:",
        ]
        
        for msg in result['messages']:
            report.append(f"- {msg}")
            
        if result['recommendations']:
            report.append("\nRecommendations:")
            for rec in result['recommendations']:
                report.append(f"- {rec}")
                
        report.append("\n==============================")
        return '\n'.join(report)

def main():
    checker = ATSFormatChecker()
    result = checker.check_file()
    report = checker.generate_report(result)
    
    print(report)
    
    # Show message box with results
    messagebox.showinfo("ATS Check Results", 
                       f"Score: {result['score']}/100\n\n" +
                       "See console for full report.")

if __name__ == "__main__":
    main()