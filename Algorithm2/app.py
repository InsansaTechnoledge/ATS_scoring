from flask import Flask, request, jsonify
import fitz  # PyMuPDF
from Grammar.grammar_checker import GrammarChecker
import tempfile
import os
import re
import json
import hashlib
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

RESULTS_FILE = "file_history.json"

def load_results():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, "r") as file:
            return json.load(file)
    return {}

def save_results(data):
    with open(RESULTS_FILE, "w") as file:
        json.dump(data, file, indent=4)

class ResumeAnalyzer:
    def __init__(self):
        self.grammar_checker = GrammarChecker()
        self.job_description = ""

    def extract_text_from_pdf(self, pdf_file):
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(pdf_file.read())
                tmp_file_path = tmp_file.name
            
            doc = fitz.open(tmp_file_path)
            text = "\n".join([page.get_text() for page in doc])
            doc.close()
            os.unlink(tmp_file_path)
            return text
        except Exception as e:
            return str(e)

    def analyze_resume(self, text, filename):
        ats_score = 100

        sections = self.grammar_checker._detect_resume_sections(text)
        required_sections = {'SUMMARY': 'Profile Summary', 'EXPERIENCE': 'Work Experience',
                             'EDUCATION': 'Education', 'SKILLS': 'Skills'}
        missing_sections = [display for sec, display in required_sections.items() if sec not in sections]

        if missing_sections:
            ats_score -= len(missing_sections) * 15
        if re.search(r'[^\x00-\x7F]+', text):
            ats_score -= 10
        if len(text.strip()) < 100:
            ats_score -= 20

        grammar_issues = self.grammar_checker.check_grammar(text)
        ats_score -= len(grammar_issues) * 1

        passive_issues = self.analyze_passive_voice(text)
        ats_score -= len(passive_issues) * 2

        jd_keywords = self._extract_keywords(self.job_description)
        resume_keywords = self._extract_keywords(text)
        missing_keywords = list(set(jd_keywords) - set(resume_keywords))
        ats_score -= len(missing_keywords) * 2

        unique_id = hashlib.md5(filename.encode()).hexdigest()
        timestamp = datetime.datetime.utcnow().isoformat()
        
        result = {
            unique_id: {
                "filename": filename,
                "last_checked": timestamp,
                "result": {
                    "score": max(0, ats_score),
                    "messages": [
                        "Grammar Issues Found: " + str(len(grammar_issues)),
                        "Too few words (minimum 200)" if len(text.split()) < 200 else "Sufficient word count",
                        "Missing sections: " + ", ".join(missing_sections) if missing_sections else "All required sections present",
                    ],
                    "file_type": "application/pdf",
                    "word_count": len(text.split()),
                    "sections_present": list(sections.keys()),
                    "sections_missing": missing_sections,
                    "formatting_issues": [],
                    "recommendations": [
                        "Fix grammar mistakes for better ATS compliance." if grammar_issues else "Grammar is good.",
                        "Use a single font type throughout the document." if re.search(r'<font>', text) else "Font consistency maintained.",
                    ]
                }
            }
        }
        
        # Load existing results and update
        stored_results = load_results()
        stored_results.update(result)
        save_results(stored_results)
        
        print(json.dumps(result, indent=4))  # Print to terminal
        
        return result
    
    def analyze_passive_voice(self, text):
        passive_phrases = [
            "was", "were", "has been", "have been", "had been", "will be", "shall be",
            "being", "is being", "are being", "was being", "were being"
        ]
        sentences = text.split('.')
        return [sent.strip() for sent in sentences if any(phrase in sent for phrase in passive_phrases)]

    def _extract_keywords(self, text: str):
        return set(re.findall(r'\b\w+\b', text.lower())) if text else set()

analyzer = ResumeAnalyzer()

@app.route('/', methods=['GET'])
def home():
    return "Server is running"

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    analyzer.job_description = request.form.get("job_description", "")
    
    text = analyzer.extract_text_from_pdf(file)
    if not text:
        return jsonify({"error": "Failed to extract text from PDF"}), 500
    
    result = analyzer.analyze_resume(text, file.filename)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)