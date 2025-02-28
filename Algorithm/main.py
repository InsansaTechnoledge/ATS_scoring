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
from Format.resume_format_checker import ResumeFormatChecker
from Config.config_gui import ConfigGUI
from LinkedIn.linkedin_checker import LinkedInProfileAnalyzer
from Grammar.grammar_checker import GrammarChecker
from Duplicate.duplicate_content_checker import DuplicateContentChecker
from Grammar.new_grammar_checker import check_text_grammar_spelling

class ATSFormatChecker:

    file_path = ''

    def __init__(self):
        self.format_scores = {
            'application/pdf': 100,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 100,  # docx
            'application/msword': 80,  # doc
            'text/plain': 70,  # txt
            'application/rtf': 60,  # rtf
        }

        self.format_checker = ResumeFormatChecker()
        self.grammar_checker = GrammarChecker()
        self.linkedin_checker = LinkedInProfileAnalyzer()
        self.duplicate_checker = DuplicateContentChecker()


        
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
            filename='Logs/ats_checker.log',
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
            current_dir = os.path.dirname(os.path.abspath(__file__))
            config_path = os.path.join(current_dir, 'Config', 'config.json')
            
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
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

    def save_to_history(self, result):
        """Save file processing result to history"""
        file_hash = self.get_file_hash()
        self.history[file_hash] = {
            'filename': os.path.basename(self.file_path),
            'last_checked': datetime.now().isoformat(),
            'result': result
        }
        
        try:
            with open(self.history_file, 'w') as f:
                json.dump(self.history, f, indent=4)
        except Exception as e:
            logging.error(f"Error saving history: {e}")

    def get_file_hash(self):
        """Generate hash for file"""
        hasher = hashlib.md5()
        with open(self.file_path, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()

    def check_file_size(self):
        """Check if file size is within acceptable range"""
        file_size = os.path.getsize(self.file_path)
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
        """Check for forbidden characters in the document."""
        found_chars = []

        for char in self.config['forbidden_characters']:
            char = bytes(char, "utf-8").decode("unicode_escape")  # Convert escaped characters
            if char in text:
                found_chars.append(char)

        return not found_chars, found_chars


    def get_file_type(self):
        """Determine the file type using magic library"""
        try:
            mime = magic.Magic(mime=True)
            return mime.from_file(self.file_path)
        except Exception as e:
            logging.error(f"Error determining file type: {e}")
            return None


    def extract_text_from_docx(self):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(self.file_path)
            return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logging.error(f"Error extracting text from DOCX: {e}")
            return None

    def is_ats_compliant_pdf(self):
        """Check if the PDF contains selectable text and analyze its structure"""
        try:
            doc = fitz.open(self.file_path)
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

    def calculate_format_score(self):
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
        if not Path(self.file_path).exists():
            result['messages'].append("File not found.")
            return result

        # Check file size
        size_ok, size_message = self.check_file_size()
        if not size_ok:
            result['messages'].append(size_message)
            return result

        # Get file type
        file_type = self.get_file_type()
        result['file_type'] = file_type

        if file_type not in self.format_scores:
            result['messages'].append(f"Unsupported file format: {file_type}")
            result['recommendations'].append("Convert document to PDF or DOCX format")
            return result

        # Extract text based on file type
        text_content = None
        if file_type == 'application/pdf':
            is_ats_friendly, message = self.is_ats_compliant_pdf()
            if not is_ats_friendly:
                result['messages'].append(message)
                result['recommendations'].append("Convert PDF to searchable text format")
                return result
            text_content = fitz.open(self.file_path).get_page_text(0)
        elif file_type.endswith('wordprocessingml.document'):
            text_content = self.extract_text_from_docx()
        elif file_type == 'text/plain':
            with open(self.file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
                
        # ✅ Resume Keyword Analysis
        industry_keywords = set(self.linkedin_checker.get_all_keywords())
        keyword_analysis = self.grammar_checker.analyze_resume_keywords(text_content, list(industry_keywords))
        print("into the keyword analysis",keyword_analysis)
        if keyword_analysis['keyword_count'] < 5:
            result["messages"].append("Not enough industry-specific keywords detected.")
            result["recommendations"].append("Add more relevant keywords related to your industry.")

        # ✅ Passive Voice Check
        passive_sentences = self.grammar_checker.check_passive_voice(text_content)
        print("into the passive voice check",passive_sentences)
        if passive_sentences:
            result["messages"].append(f"Found {len(passive_sentences)} sentences using passive voice.")
            result["recommendations"].append("Use active voice for stronger impact.")

        # ✅ Improvement Suggestions
        improvement_suggestions = self.grammar_checker.get_improvement_suggestions(text_content)
        if improvement_suggestions['style_suggestions']:
            result["messages"].append("Stylistic Improvements Suggested:")
            for suggestion in improvement_suggestions['style_suggestions']:
                result["recommendations"].append(suggestion)

        # ✅ Extract resume sections
        sections = self.linkedin_checker.extract_sections(text_content)
        print("into the extract resume sections",sections)

        # ✅ LinkedIn Profile Best Practices
        linkedin_suggestions = self.linkedin_checker.generate_improvement_suggestions(sections)
        print("into the linkedin suggestions",linkedin_suggestions)
        if linkedin_suggestions:
            result["messages"].append("LinkedIn Optimization Suggestions:")
            for suggestion in linkedin_suggestions:
                result["recommendations"].append(suggestion)
                
        grammar_issues = self.grammar_checker.check_grammar(text_content)
        readability_scores = self.grammar_checker.analyze_readability(text_content)


        if text_content:
            # ✅ NEW: Grammar and Readability Check
            # grammar_issues = self.grammar_checker.check_grammar(text_content)
            grammar_issues = check_text_grammar_spelling(text_content)
            readability_scores = self.grammar_checker.analyze_readability(text_content)

            if grammar_issues:
                result["messages"].append(f"Grammar Issues Found: {len(grammar_issues)}")
                result["recommendations"].append("Fix grammar mistakes for better ATS compliance.")
                result['grammar_issues'] = []
                for issue in grammar_issues:  # Show up to 5 grammar issues
                    result['grammar_issues'].append(f"{issue}")

            # ✅ Add Readability Score
            result["messages"].append("Readability Scores:")
            for key, value in readability_scores.items():
                result["messages"].append(f"  {key}: {value:.2f}")
                
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
            
            # ✅ Forbidden character check
 
        format_ok, found_chars = self.check_forbidden_characters(text_content)
        if not format_ok:
            result['formatting_issues'] = found_chars
            result['messages'].append(f"Found forbidden characters: {', '.join(found_chars)}")
            result['recommendations'].append("Remove non-ATS-friendly characters.")

            # Check for formatting issues
        format_ok, found_chars = self.check_forbidden_characters(text_content)
        if not format_ok:
            result['formatting_issues'] = found_chars
            result['messages'].append(f"Found formatting issues: {', '.join(found_chars)}")
            result['recommendations'].append("Fix formatting issues and special characters")
        job_description = self.job_description
        linkedin_results = self.linkedin_checker.analyze_profile(text_content, job_description if job_description else None)

        # ✅ LinkedIn Best Practices Check
        if not linkedin_results.linkedin_compatibility:
            result["messages"].append(f"Missing LinkedIn best-practice sections: {', '.join(linkedin_results.missing_sections)}")
            result["recommendations"].append("Add missing sections for LinkedIn compatibility.")

        # ✅ Job Mat   ching Score (if job description provided)
        if linkedin_results.job_match_score is not None:
            result["messages"].append(f"Job Match Score: {linkedin_results.job_match_score}%")
            if linkedin_results.job_match_score < 60:
                result["recommendations"].append("Improve resume alignment with job description.")

        is_duplicate, duplicate_sections = self.duplicate_checker.check_duplicate_content(text_content)
        if is_duplicate:
            result['messages'].append("Resume contains duplicated content from common templates.")
            result['recommendations'].append("Reword generic sections to make your resume unique.")
            for section in duplicate_sections:
                result['messages'].append(f" - Duplicate section: {section[:50]}...")


        # ✅ NEW: Analyze formatting using the ResumeFormatChecker module
        format_analysis = self.format_checker.analyze_format(self.file_path,file_type)
        
        if format_analysis:
            # Font consistency check
            if not format_analysis["font_consistency"]:
                result["messages"].append("Inconsistent font usage detected.")
                result["recommendations"].append("Use a single font type throughout the document.")
            
            result["messages"].append(f"Most used font: {format_analysis['most_used_font']}")

            # Bullet point check
            # Adjust the bullet point threshold based on total word count
            total_words = len(text_content.split())
            if total_words < 500:
                bullet_limit = 15  # Entry-level resumes
            elif total_words < 1000:
                bullet_limit = 25  # Mid-level professionals
            else:
                bullet_limit = 35  # Senior/executive level

            # Flag excessive bullet points
            if format_analysis["bullet_count"] > bullet_limit:
                result["messages"].append(f"Excessive bullet points detected ({format_analysis['bullet_count']}).")
                result["recommendations"].append(f"Limit bullet points to a maximum of {bullet_limit} for better readability.")
            
            if "experience" in sections and format_analysis["bullet_count"] < 5:
                result["messages"].append("Work Experience section lacks bullet points.")
                result["recommendations"].append("Consider using bullet points to highlight key achievements.")

             # ✅ Suggest converting long paragraphs to bullet points
            if any(len(sentence.split()) > 20 for sentence in text_content.split("\n")):
                result["recommendations"].append("Consider breaking long paragraphs into concise bullet points for readability.")

            # Section headers check
            if len(format_analysis["headers_found"]) < 3:
                result["messages"].append(f"Few section headers found: {', '.join(format_analysis['headers_found'])}")
                result["recommendations"].append("Ensure major sections like Experience, Education, and Skills are included.")

        # ✅ NEW: Calculate deductions based on formatting issues
        base_score = self.format_scores[file_type]
        deductions = 0

        # Deduct points for word count issues
        if not word_count_ok:
            deductions += 30

        # Deduct points for missing sections
        if not sections_ok:
            deductions += 20 * len(missing_sections)
        
        # Deduct points for forbidden characters
        if not format_ok:
            deductions += 5 * len(found_chars)


        # Deduct points for formatting issues
        if not format_ok:
            deductions += 10 * len(found_chars)

        # Deduct points for inconsistent fonts
        if format_analysis and not format_analysis["font_consistency"]:
            deductions += 10

        # Deduct points for excessive bullet points
        if format_analysis and format_analysis["bullet_count"] > 15:
            deductions += 10

        # Deduct points for missing section headers
        if format_analysis and len(format_analysis["headers_found"]) < 3:
            deductions += 15

        # Final Score Calculation
        result['score'] = max(0, base_score - deductions)

        # Save to history
        self.save_to_history(result)

        return result

    
    def check_file(self):
        """Open file dialog and check format compatibility"""
        # self.file_path = filedialog.askopenfilename(
        #     title="Select Resume File",
        #     filetypes=[
        #         ("All Supported Formats", "*.pdf;*.docx;*.doc;*.txt;*.rtf"),
        #         ("PDF Files", "*.pdf"),
        #         ("Word Files", "*.docx;*.doc"),
        #         ("Text Files", "*.txt"),
        #         ("RTF Files", "*.rtf")
        #     ]
        # )
        print("into the check file !!!")
        if not self.file_path:
            return {
                'score': 0,
                'messages': ["No file selected."],
                'file_type': None
            }

        return self.calculate_format_score()

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
    checker.file_path='Uploads/Jay Amrish Fanse_Resume_December2024.pdf'
    checker.job_description = ''
    result = checker.check_file()
    report = checker.generate_report(result)
    
    print(report)
    
    # # Show message box with results
    # messagebox.showinfo("ATS Check Results", 
    #                    f"Score: {result['score']}/100\n\n" +
    #                    "See console for full report.")

if __name__ == "__main__":
    main()

def analyseResume(file_path, job_description):
    checker = ATSFormatChecker()
    checker.file_path = file_path
    checker.job_description = job_description
    result = checker.check_file()
    report = checker.generate_report(result)
    
    
    response = {
        'filename': os.path.basename(file_path),
        'last_checked': datetime.now().isoformat(),
        'result': result
    }

    # Show message box with results
    # messagebox.showinfo("ATS Check Results", 
    #                    f"Score: {result['score']}/100\n\n" +
    #                    "See console for full report.")

    return response

# def main():
#     checker = ATSFormatChecker()
#     config_editor = ConfigGUI()

#     while True:
#         choice = input("\nChoose an option:\n1. Check Resume\n2. Edit Configurations\n3. Exit\nEnter choice: ")

#         if choice == "1":
#             result = checker.check_file()
#             report = checker.generate_report(result)
#             print(report)
#             messagebox.showinfo("ATS Check Results", f"Score: {result['score']}/100\n\nSee console for full report.")

#         elif choice == "2":
#             config_editor.open_gui()

#         elif choice == "3":
#             print("Exiting...")
#             break

#         else:
#             print("Invalid choice! Please enter 1, 2, or 3.")

# if __name__ == "__main__":
#     main()
