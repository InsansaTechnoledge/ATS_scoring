from flask import Flask, request, jsonify, send_file
import fitz  # PyMuPDF
from Grammar.grammar_checker import GrammarChecker
import tempfile
import os
import re
import json
import hashlib
import datetime
import threading
import time
from flask_cors import CORS
import logging
from collections import Counter
import statistics

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("resume_analyzer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

RESULTS_FILE = "file_history.json"
BACKUP_DIR = "backups"

# Create backup directory if it doesn't exist
os.makedirs(BACKUP_DIR, exist_ok=True)

# Common resume buzzwords to avoid
BUZZWORDS = {
    "synergy", "dynamic", "proactive", "team player", "detail-oriented", "results-driven",
    "hardworking", "passionate", "innovative", "motivated", "experienced", "excellent",
    "responsible", "creative", "efficient", "organized", "extensive experience"
}

# Industry-specific keywords for bonus scoring
INDUSTRY_KEYWORDS = {
    "tech": ["python", "javascript", "aws", "cloud", "api", "data", "algorithm", "frontend", "backend", "fullstack"],
    "finance": ["finance", "accounting", "budget", "forecast", "analysis", "investment", "banking", "portfolio"],
    "healthcare": ["patient", "clinical", "healthcare", "medical", "diagnosis", "treatment", "care", "health"],
    "marketing": ["marketing", "campaign", "social media", "seo", "content", "brand", "advertising", "audience"]
}

def load_results():
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            logger.error("Error loading results file, creating new one")
            return {}
    return {}

def save_results(data):
    # Create a backup first
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"file_history_{timestamp}.json")
    
    try:
        # Save backup
        with open(backup_path, "w") as file:
            json.dump(data, file, indent=4)
        
        # Save main file
        with open(RESULTS_FILE, "w") as file:
            json.dump(data, file, indent=4)
            
        # Remove old backups (keep only last 10)
        cleanup_backups()
    except Exception as e:
        logger.error(f"Error saving results: {str(e)}")

def cleanup_backups():
    """Keep only the 10 most recent backups"""
    backup_files = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) 
                   if f.startswith("file_history_") and f.endswith(".json")]
    if len(backup_files) > 10:
        backup_files.sort()
        for old_file in backup_files[:-10]:
            try:
                os.remove(old_file)
            except Exception as e:
                logger.error(f"Failed to remove old backup {old_file}: {str(e)}")

class ResumeAnalyzer:
    def __init__(self):
        self.grammar_checker = GrammarChecker()
        self.job_description = ""
        self.cache = {}
        self.lock = threading.Lock()
        # Start the cache cleanup thread
        threading.Thread(target=self._cleanup_cache_periodically, daemon=True).start()

    def _cleanup_cache_periodically(self):
        """Periodically clean up the cache to prevent memory leaks"""
        while True:
            time.sleep(3600)  # Run every hour
            with self.lock:
                current_time = time.time()
                keys_to_remove = [k for k, v in self.cache.items() 
                                if current_time - v['timestamp'] > 86400]  # Remove items older than 24 hours
                for key in keys_to_remove:
                    del self.cache[key]
                logger.info(f"Cache cleanup: removed {len(keys_to_remove)} items")

    def extract_text_from_pdf(self, pdf_file):
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                pdf_content = pdf_file.read()
                tmp_file.write(pdf_content)
                tmp_file_path = tmp_file.name
            
            # Generate a hash of the file content to use as cache key
            file_hash = hashlib.md5(pdf_content).hexdigest()
            
            # Check if we've already processed this exact file
            with self.lock:
                if file_hash in self.cache:
                    logger.info(f"Cache hit for file {file_hash}")
                    os.unlink(tmp_file_path)
                    return self.cache[file_hash]['text']
            
            doc = fitz.open(tmp_file_path)
            text = "\n".join([page.get_text() for page in doc])
            
            # Store metadata about the document
            metadata = {
                "page_count": len(doc),
                "author": doc.metadata.get("author", ""),
                "title": doc.metadata.get("title", ""),
                "creation_date": doc.metadata.get("creationDate", "")
            }
            
            doc.close()
            os.unlink(tmp_file_path)
            
            # Cache the extracted text
            with self.lock:
                self.cache[file_hash] = {
                    'text': text,
                    'metadata': metadata,
                    'timestamp': time.time()
                }
            
            return text
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return str(e)

    def analyze_resume(self, text, filename):
        ats_score = 100
        detailed_scores = {}
        recommendations = []

        # Basic section detection
        sections = self.grammar_checker._detect_resume_sections(text)
        required_sections = {
            'SUMMARY': 'Profile Summary', 
            'EXPERIENCE': 'Work Experience',
            'EDUCATION': 'Education', 
            'SKILLS': 'Skills',
            'PROJECTS': 'Projects',
            'CERTIFICATIONS': 'Certifications'
        }
        
        missing_sections = [display for sec, display in required_sections.items() if sec not in sections]

        # Section scoring
        section_score = 100 - (len(missing_sections) * 10)
        detailed_scores["sections"] = section_score
        
        if missing_sections:
            recommendations.append(f"Add missing sections: {', '.join(missing_sections)}")
        
        # Check for non-ASCII characters
        non_ascii_chars = re.findall(r'[^\x00-\x7F]+', text)
        if non_ascii_chars:
            ats_score -= 10
            recommendations.append("Remove special characters that may not be ATS-friendly")
        
        # Length checks
        word_count = len(text.split())
        if word_count < 200:
            ats_score -= 20
            recommendations.append("Resume is too short. Aim for at least 300-600 words")
        elif word_count > 1000:
            ats_score -= 10
            recommendations.append("Resume may be too long. Consider condensing to 1-2 pages")
        
        # Grammar and spelling check
        grammar_issues = self.grammar_checker.check_grammar(text)
        grammar_score = max(0, 100 - (len(grammar_issues) * 5))
        detailed_scores["grammar"] = grammar_score
        if grammar_issues:
            recommendations.append(f"Fix {len(grammar_issues)} grammar/spelling issues")
        
        # Passive voice analysis
        passive_issues = self.analyze_passive_voice(text)
        passive_score = max(0, 100 - (len(passive_issues) * 5))
        detailed_scores["active_voice"] = passive_score
        
        if len(passive_issues) > 5:
            recommendations.append("Use more active voice instead of passive constructions")
        
        # Buzzwords analysis
        buzzword_count = sum(1 for word in BUZZWORDS if word.lower() in text.lower())
        buzzword_score = max(0, 100 - (buzzword_count * 5))
        detailed_scores["buzzwords"] = buzzword_score
        
        if buzzword_count > 3:
            recommendations.append(f"Replace generic buzzwords with specific achievements")
        
        # Job description keyword matching
        jd_keywords = self._extract_keywords(self.job_description)
        resume_keywords = self._extract_keywords(text)
        matching_keywords = set(resume_keywords) & set(jd_keywords)
        missing_keywords = list(set(jd_keywords) - set(resume_keywords))
        
        keyword_match_score = 0
        if jd_keywords:
            keyword_match_score = min(100, int((len(matching_keywords) / len(jd_keywords)) * 100))
        detailed_scores["keyword_match"] = keyword_match_score
        
        if missing_keywords and len(missing_keywords) > 0:
            top_missing = sorted(missing_keywords, key=lambda k: k in jd_keywords)[:5]
            recommendations.append(f"Add these keywords from the job description: {', '.join(top_missing)}")
        
        # Contact information check
        has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
        has_phone = bool(re.search(r'\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', text))
        
        if not has_email or not has_phone:
            ats_score -= 10
            recommendations.append("Ensure contact information (email and phone) is clearly visible")
        
        # Check for action verbs at the beginning of bullet points
        action_verbs = ["achieved", "improved", "created", "implemented", "developed", "managed", "led", 
                        "increased", "decreased", "reduced", "delivered", "launched", "designed"]
        bullet_points = re.findall(r'•[^•]*', text)
        action_verb_count = sum(1 for bp in bullet_points if any(bp.strip().lower().startswith(f"• {verb}") for verb in action_verbs))
        
        action_verb_score = min(100, int((action_verb_count / max(1, len(bullet_points))) * 100))
        detailed_scores["action_verbs"] = action_verb_score
        
        if action_verb_score < 70:
            recommendations.append("Start bullet points with strong action verbs")
        
        # Check for quantifiable achievements
        has_numbers = bool(re.search(r'(\d+%|\$\d+|\d+ [a-zA-Z]+)', text))
        if not has_numbers:
            ats_score -= 10
            recommendations.append("Include quantifiable achievements (%, $, metrics)")
        
        # Industry-specific bonus
        industry = self.detect_industry(text)
        industry_keywords = INDUSTRY_KEYWORDS.get(industry, [])
        industry_keyword_matches = sum(1 for kw in industry_keywords if kw in text.lower())
        
        # Calculate final ATS score as weighted average of component scores
        component_weights = {
            "sections": 0.15,
            "grammar": 0.15,
            "active_voice": 0.1,
            "buzzwords": 0.1,
            "keyword_match": 0.3,
            "action_verbs": 0.2
        }
        
        final_score = sum(score * component_weights[component] for component, score in detailed_scores.items())
        # Add industry bonus (up to 5 points)
        final_score += min(5, industry_keyword_matches)
        
        # Generate unique ID and timestamp
        unique_id = hashlib.md5(filename.encode()).hexdigest()
        timestamp = datetime.datetime.utcnow().isoformat()
        
        # Prepare final result
        result = {
            unique_id: {
                "filename": filename,
                "last_checked": timestamp,
                "result": {
                    "score": max(0, int(final_score)),
                    "component_scores": detailed_scores,
                    "messages": [
                        f"Grammar Issues: {len(grammar_issues)}",
                        f"Passive Voice Instances: {len(passive_issues)}",
                        f"Word Count: {word_count} words",
                        f"Missing Sections: {', '.join(missing_sections) if missing_sections else 'None'}",
                        f"Job Description Keyword Match: {keyword_match_score}%",
                        f"Detected Industry: {industry.capitalize() if industry else 'General'}"
                    ],
                    "file_type": "application/pdf",
                    "word_count": word_count,
                    "sections_present": list(sections.keys()),
                    "sections_missing": missing_sections,
                    "formatting_issues": self.detect_formatting_issues(text),
                    "recommendations": recommendations,
                    "industry": industry
                }
            }
        }
        
        # Load existing results and update
        stored_results = load_results()
        stored_results.update(result)
        save_results(stored_results)
        
        logger.info(f"Analyzed resume: {filename}, Score: {int(final_score)}")
        
        return result[unique_id]
    
    def analyze_passive_voice(self, text):
        passive_phrases = [
            "was", "were", "has been", "have been", "had been", "will be", "shall be",
            "being", "is being", "are being", "was being", "were being"
        ]
        sentences = text.split('.')
        passive_sentences = []
        
        for sent in sentences:
            sent = sent.strip()
            if not sent:
                continue
                
            words = sent.lower().split()
            if any(phrase in words for phrase in passive_phrases):
                # More accurately check if it's truly passive voice
                if any(re.search(r'\b(was|were|been|be) [a-zA-Z]+ed\b', sent.lower()) for phrase in passive_phrases):
                    passive_sentences.append(sent)
                    
        return passive_sentences

    def _extract_keywords(self, text: str):
        """Extract meaningful keywords from text, filtering out common words"""
        if not text:
            return set()
            
        # Common words to filter out
        common_words = {'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'of', 'by'}
        
        # Extract all words
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Filter out common words and count occurrences
        word_counts = Counter(word for word in words if word not in common_words)
        
        # Return most common keywords (words that appear more than once)
        return set(word for word, count in word_counts.items() if count > 1)
    
    def detect_formatting_issues(self, text):
        issues = []
        
        # Check for inconsistent spacing
        if re.search(r'[^\n]\n[^\n]', text):
            issues.append("Inconsistent line spacing detected")
        
        # Check for extremely long paragraphs
        paragraphs = text.split('\n\n')
        for p in paragraphs:
            if len(p.split()) > 100:
                issues.append("Extremely long paragraph detected (consider breaking it up)")
                break
        
        # Check for potential font inconsistencies (based on weird character spacing)
        if re.search(r'[A-Za-z][\s]{2,}[A-Za-z]', text):
            issues.append("Possible font or spacing inconsistency detected")
            
        return issues
    
    def detect_industry(self, text):
        """Detect the industry based on keyword frequency"""
        text_lower = text.lower()
        
        industry_scores = {}
        for industry, keywords in INDUSTRY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            industry_scores[industry] = matches
            
        if not industry_scores:
            return None
            
        # Return the industry with the highest score
        return max(industry_scores.items(), key=lambda x: x[1])[0]
    
    def generate_report(self, result):
        """Generate a detailed text report of the analysis"""
        report = []
        report.append("=" * 50)
        report.append(f"RESUME ANALYSIS REPORT: {result['filename']}")
        report.append("=" * 50)
        report.append(f"Date: {result['last_checked']}")
        report.append(f"Overall ATS Score: {result['result']['score']}/100")
        report.append("\nBREAKDOWN:")
        
        for component, score in result['result'].get('component_scores', {}).items():
            report.append(f"- {component.replace('_', ' ').title()}: {score}/100")
        
        report.append("\nKEY FINDINGS:")
        for message in result['result']['messages']:
            report.append(f"- {message}")
            
        if result['result']['sections_missing']:
            report.append("\nMISSING SECTIONS:")
            for section in result['result']['sections_missing']:
                report.append(f"- {section}")
                
        if result['result']['formatting_issues']:
            report.append("\nFORMATTING ISSUES:")
            for issue in result['result']['formatting_issues']:
                report.append(f"- {issue}")
                
        report.append("\nRECOMMENDATIONS:")
        for rec in result['result']['recommendations']:
            report.append(f"- {rec}")
            
        return "\n".join(report)

# Initialize the analyzer
analyzer = ResumeAnalyzer()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "active",
        "service": "Resume ATS Analyzer",
        "endpoints": [
            {"path": "/analyze", "method": "POST", "description": "Analyze a resume against a job description"},
            {"path": "/history", "method": "GET", "description": "Get history of analyzed resumes"},
            {"path": "/report/<file_id>", "method": "GET", "description": "Get detailed report for a specific analysis"},
            {"path": "/stats", "method": "GET", "description": "Get aggregate statistics across all analyzed resumes"}
        ]
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are supported"}), 400
        
        analyzer.job_description = request.form.get("job_description", "")
        
        logger.info(f"Analyzing file: {file.filename}")
        text = analyzer.extract_text_from_pdf(file)
        if not text or len(text) < 50:
            return jsonify({"error": "Failed to extract text from PDF or text too short"}), 500
        
        result = analyzer.analyze_resume(text, file.filename)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get history of analyzed resumes"""
    try:
        results = load_results()
        
        # Optionally filter by date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date or end_date:
            filtered_results = {}
            for file_id, data in results.items():
                file_date = datetime.datetime.fromisoformat(data['last_checked'])
                
                if start_date:
                    start = datetime.datetime.fromisoformat(start_date)
                    if file_date < start:
                        continue
                        
                if end_date:
                    end = datetime.datetime.fromisoformat(end_date)
                    if file_date > end:
                        continue
                        
                filtered_results[file_id] = data
            
            return jsonify(filtered_results)
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error in history endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/report/<file_id>', methods=['GET'])
def get_report(file_id):
    """Get a detailed report for a specific analysis"""
    try:
        results = load_results()
        
        if file_id not in results:
            return jsonify({"error": f"No analysis found for ID: {file_id}"}), 404
            
        result = results[file_id]
        
        format_type = request.args.get('format', 'json')
        
        if format_type == 'text':
            report_text = analyzer.generate_report(result)
            
            # Create a temporary text file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w') as tmp_file:
                tmp_file.write(report_text)
                tmp_file_path = tmp_file.name
                
            return send_file(
                tmp_file_path,
                as_attachment=True,
                download_name=f"resume_report_{file_id}.txt",
                mimetype="text/plain"
            )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in report endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get aggregate statistics across all analyzed resumes"""
    try:
        results = load_results()
        
        if not results:
            return jsonify({"error": "No data available"}), 404
            
        scores = []
        word_counts = []
        industry_counts = {}
        common_issues = Counter()
        
        for file_id, data in results.items():
            if 'result' in data:
                result = data['result']
                scores.append(result.get('score', 0))
                word_counts.append(result.get('word_count', 0))
                
                industry = result.get('industry')
                if industry:
                    industry_counts[industry] = industry_counts.get(industry, 0) + 1
                
                # Count common issues
                for rec in result.get('recommendations', []):
                    common_issues[rec] += 1
        
        stats = {
            "total_resumes": len(results),
            "score_metrics": {
                "average": statistics.mean(scores) if scores else 0,
                "median": statistics.median(scores) if scores else 0,
                "min": min(scores) if scores else 0,
                "max": max(scores) if scores else 0
            },
            "word_count_metrics": {
                "average": int(statistics.mean(word_counts)) if word_counts else 0,
                "median": int(statistics.median(word_counts)) if word_counts else 0,
                "min": min(word_counts) if word_counts else 0,
                "max": max(word_counts) if word_counts else 0
            },
            "industry_distribution": industry_counts,
            "common_issues": {issue: count for issue, count in common_issues.most_common(5)}
        }
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error in stats endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/compare', methods=['POST'])
def compare_resumes():
    """Compare multiple resumes against a job description"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
        
        files = request.files.getlist('files')
        if len(files) < 2:
            return jsonify({"error": "At least two files are required for comparison"}), 400
        
        job_description = request.form.get("job_description", "")
        analyzer.job_description = job_description
        
        results = []
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                continue
                
            text = analyzer.extract_text_from_pdf(file)
            if not text or len(text) < 50:
                continue
                
            result = analyzer.analyze_resume(text, file.filename)
            results.append(result)
        
        # Sort results by score
        results.sort(key=lambda x: x['result']['score'], reverse=True)
        
        return jsonify({
            "comparison": results,
            "best_match": results[0] if results else None,
            "job_description": job_description
        })
    except Exception as e:
        logger.error(f"Error in compare endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)