import hashlib
import tempfile
import os
import re
import fitz  # PyMuPDF
import logging
import textract
import pytesseract
from pdf2image import convert_from_path
from models.resume import ResumeAnalysisResult
from utils.cache import cache_manager
from utils.text_processing import extract_keywords, analyze_passive_voice, detect_formatting_issues, detect_industry
from utils.constants import BUZZWORDS, INDUSTRY_KEYWORDS, ACTION_VERBS
from config import REQUIRED_SECTIONS
from services.file_service import load_results, save_results
from Grammar.core.checker import GrammarChecker

logger = logging.getLogger(__name__)

class ResumeAnalyzer:
    def __init__(self):
        self.grammar_checker = GrammarChecker()
        self.job_description = ""

    def extract_text_from_file(self, file):
        """Extract text content from various file types"""
        try:
            file_content = file.read()
            file.seek(0)
            file_hash = hashlib.md5(file_content).hexdigest()
            cached_data = cache_manager.get(file_hash)
            if cached_data:
                return cached_data['text']
            
            filename = file.filename.lower()
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_file.write(file_content)
                tmp_file_path = tmp_file.name
            
            try:
                if filename.endswith('.pdf'):
                    text, metadata = self._extract_from_pdf(tmp_file_path)
                elif filename.endswith('.docx'):
                    text, metadata = self._extract_from_docx(tmp_file_path)
                elif filename.endswith('.txt'):
                    text, metadata = self._extract_from_txt(tmp_file_path)
                else:
                    text, metadata = self._extract_with_textract(tmp_file_path, filename)
                
                cache_manager.set(file_hash, {'text': text, 'metadata': metadata})
                return text
            finally:
                if os.path.exists(tmp_file_path):
                    os.unlink(tmp_file_path)
        except Exception as e:
            logger.error(f"Error extracting text from {file.filename}: {str(e)}")
            return None

    def _extract_from_pdf(self, file_path):
        """Extract text from PDF using PyMuPDF and fallback to OCR if needed"""
        try:
            doc = fitz.open(file_path)
            text = "\n".join([page.get_text("text") for page in doc])
            
            if not text.strip():  # If no text is extracted, try OCR
                text = self._extract_text_from_scanned_pdf(file_path)
            
            metadata = {
                "page_count": len(doc),
                "author": doc.metadata.get("author", ""),
                "title": doc.metadata.get("title", ""),
                "creation_date": doc.metadata.get("creationDate", ""),
                "file_type": "pdf"
            }
            
            doc.close()
            return text, metadata
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return "", {}

    def _extract_text_from_scanned_pdf(self, file_path):
        """Use OCR to extract text from scanned PDFs"""
        try:
            images = convert_from_path(file_path)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
            return text
        except Exception as e:
            logger.error(f"OCR failed on scanned PDF: {str(e)}")
            return ""


    def analyze_resume(self, text, filename):
        """Analyze resume text and generate scoring and recommendations"""
        # Create result object
        result = ResumeAnalysisResult(filename, text)
        result.score = 100

        penalty_counter = {
            "missing_sections": 0,
            "grammar_issues": 0,
            "passive_voice": 0,
            "buzzwords": 0,
            "formatting_issues": 0,
            "word_count_low": 0,
            "word_count_high": 0,
            "non_ascii": 0
        }

        # Basic section detection
        sections = self.grammar_checker.section_analyzer.detect_resume_sections(text)
        normalized_sections = {s.lower().strip() for s in sections}
  
        # Sections present
        result.sections_present = [sec for sec, (alt_names, _) in REQUIRED_SECTIONS.items() if any(name.lower().strip() in normalized_sections for name in alt_names)]
        
        # Sections missing:
        result.sections_missing = [sec for sec, (alt_names, _) in REQUIRED_SECTIONS.items() if not any(name.lower().strip() in normalized_sections for name in alt_names)]

        # Deduct percentage-based penalties
        missing_penalty = sum(REQUIRED_SECTIONS[sec][1] * 100 for sec in result.sections_missing)  # Convert fractions to percentages
        result.score -= missing_penalty


        # Section scoring
        penalty_counter["missing_sections"] = len(result.sections_missing)
        result.score -= min(10, int(penalty_counter["missing_sections"] / 3 * 5))
        

        if result.sections_missing:
            result.recommendations.append(f"Add missing sections: {', '.join(result.sections_missing)}")
        
        #Print sections present for debugging
        if result.sections_present:
            print("Sections Present in Resume:", result.sections_present)  # Debugging output
        
        # Check for non-ASCII characters
        non_ascii_chars = re.findall(r'[^\x00-\x7F]+', text)
        penalty_counter["non_ascii"] = len(non_ascii_chars)
        result.score -= min(10, int(penalty_counter["non_ascii"] / 3 * 10))
        if penalty_counter["non_ascii"] >= 1:
            result.recommendations.append("Remove special characters that may not be ATS-friendly")
        
        
        # Length check

        if result.word_count < 200:
            penalty_counter["word_count_low"] += 1
        elif result.word_count > 1000:
            penalty_counter["word_count_high"] += 1


        result.score -= min(10, int(penalty_counter["word_count_low"] / 3 * 10))
        result.score -= min(5, int(penalty_counter["word_count_high"] / 3 * 5))

        if penalty_counter["word_count_low"] >= 1:
            result.recommendations.append("Resume is too short. Aim for at least 300-600 words")
        if penalty_counter["word_count_high"] >= 1:
            result.recommendations.append("Resume may be too long. Consider condensing to 1-2 pages")
    
        
        # Grammar and spelling check
        grammar_issues = self.grammar_checker.check_grammar(text)
        penalty_counter["grammar_issues"] = len(grammar_issues)
        result.score -= min(10, int(penalty_counter["grammar_issues"] / 3 * 5))

        if penalty_counter["grammar_issues"] >= 1:
            result.recommendations.append(f"Fix {len(grammar_issues)} grammar/spelling issues")

            result.grammar_flaws = grammar_issues
            print("following grammar issues detected:",grammar_issues)



        # Passive voice analysis
        passive_issues = analyze_passive_voice(text)
        penalty_counter["passive_voice"] = len(passive_issues)
        result.score -= min(10, int(penalty_counter["passive_voice"] / 3 * 5))
        if penalty_counter["passive_voice"] >= 1:
            result.recommendations.append("Use more active voice instead of passive constructions")
    
        
        # Buzzwords analysis
        detected_buzzwords = [word for word in BUZZWORDS if word.lower() in text.lower()]
        buzzword_count = len(detected_buzzwords)

        penalty_counter["buzzwords"] = buzzword_count
        result.score -= min(10, int(penalty_counter["buzzwords"] / 3 * 5))

        if buzzword_count > 0:
            result.recommendations.append(f"Fix {buzzword_count} Buzzword issues, replace with more specific achievements.")

        # Print detected buzzwords for debugging
        if detected_buzzwords:
            print("Buzzwords Detected in Resume:", detected_buzzwords)  # Debugging output
        else:
            print("No buzzwords detected in your Resume")
        
        result.buzz_words = detected_buzzwords
        print("Debugging: Buzzword List ->", detected_buzzwords)
        print("Debugging: Buzzwords stored in result ->", result.__dict__)  # Print all attributes


        # Job description keyword matching
        jd_keywords = extract_keywords(self.job_description or "")
        resume_keywords = extract_keywords(text)

        print("Extracted JD Keywords:", jd_keywords)
        print("Extracted Resume Keywords:", resume_keywords)

        # Convert to lowercase for better matching
        jd_keywords = set(map(str.lower, jd_keywords))
        resume_keywords = set(map(str.lower, resume_keywords))

        if jd_keywords:
            matching_keywords = resume_keywords & jd_keywords
            missing_keywords = list(jd_keywords - resume_keywords)

            
            keyword_match_score = min(100, int((len(matching_keywords) / len(jd_keywords)) * 100))
            result.detailed_scores["keyword_match"] = keyword_match_score

            if missing_keywords:
                top_missing = sorted(missing_keywords)[:5]  # Sort alphabetically for consistency
                
                if top_missing:  # Only proceed if there are missing keywords
                    print("Missing words from Resume as per JD:", top_missing)  # Debuggingprint("Missing words from Resume as per JD:", top_missing)  # Debugging

                if not hasattr(result, "recommendations") or result.recommendations is None:
                    result.recommendations = []

                # Add recommendation
                result.recommendations.append(f"Add these keywords from the job description: {', '.join(top_missing)}")

                # Apply penalty for missing keywords
                penalty = len(top_missing) * 2
                result.score = max(0, result.score - penalty)


        # Contact Information Check
        contact_penalty_count = 0

        has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
        has_phone = bool(re.search(r'\b(\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}(?:\s*x\d+)?\b', text))  # Improved regex for phone numbers
        

        if not has_email:
            contact_penalty_count += 1
        if not has_phone:
            contact_penalty_count += 1
        

        result.score -= (contact_penalty_count / 2) * 10  # Proportional penalty
        if contact_penalty_count > 0:
            result.recommendations.append("Ensure contact information (email and phone) is clearly visible")



        # Action Verb Analysis (Threshold-Based Deduction)
        bullet_points = re.findall(r'^[•*-]\s*(.+)', text, re.MULTILINE | re.IGNORECASE)
        action_verb_count = sum(1 for bp in bullet_points if any(bp.lower().startswith(verb) for verb in ACTION_VERBS))

        action_verb_score = min(100, int((action_verb_count / max(1, len(bullet_points))) * 100))
        result.detailed_scores["action_verbs"] = action_verb_score

        if action_verb_score < 70:  # Deduct only if <70% of bullet points start with action verbs
            result.recommendations.append("Start bullet points with strong action verbs")

        # Quantifiable Achievements (Threshold-Based Deduction)
        quantifiable_penalty_count = 0

        has_numbers = bool(re.search(r'(\d+%|\$\d+|\d+ [a-zA-Z]+)', text))
        if not has_numbers:
            quantifiable_penalty_count += 1

        result.score -= (quantifiable_penalty_count / 1) * 10  # Proportional penalty
        if quantifiable_penalty_count > 0:
            result.recommendations.append("Include quantifiable achievements (%, $, metrics)")


        # Industry-Specific Bonus
        result.industry = detect_industry(text, INDUSTRY_KEYWORDS)
        industry_keywords = INDUSTRY_KEYWORDS.get(result.industry, [])
        industry_keyword_matches = sum(1 for kw in industry_keywords if kw.lower() in text.lower())  # Ensuring case insensitivity
        result.industry_keywords = industry_keyword_matches
        print("industry keywords detected:",industry_keyword_matches)

        # Add industry bonus (up to 5 points)
        result.score += min(5, industry_keyword_matches)

        # Detect formatting issues
        result.formatting_issues = detect_formatting_issues(text)

        # Set messages
        result.set_messages()

        # Save to history (only if needed)
        stored_results = load_results()
        if stored_results is not None:
            stored_results.update(result.to_dict())
            save_results(stored_results)

        # Ensure final score is within 0-100 AFTER all adjustments
        result.score = max(0, min(100, result.score))

        logger.info(f"Analyzed resume: {filename}, Score: {int(result.score)}")

        return result.to_dict()[result.unique_id]
    

        def compare_resumes(self, files, job_description=None):
            """Compare multiple resumes against a job description"""
    
            if job_description:
                self.job_description = job_description

        results = []
        SUPPORTED_FORMATS = ('.pdf', '.docx', '.doc', '.txt', '.rtf')  # Define allowed formats

        for file in files:
            # Check file extension
            if not file.filename.lower().endswith(SUPPORTED_FORMATS):
                logger.warning(f"Skipping unsupported file: {file.filename}")
                continue

        text = self.extract_text_from_file(file)

        if not text or len(text) < 50:
            logger.warning(f"Skipping {file.filename}: Insufficient text content.")
            return

        result = self.analyze_resume(text, file.filename)
        results.append(result)

        # Sort results by score (descending order)
        results.sort(key=lambda x: x['result']['score'], reverse=True)

        return {
        "comparison": results,
        "best_match": results[0] if results else None,
        "job_description": self.job_description

        }















        