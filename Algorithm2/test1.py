import streamlit as st
import fitz  # PyMuPDF
from Grammar.grammar_checker import GrammarChecker
import tempfile
import os
import re

class ResumeAnalyzer:
    def __init__(self):
        self.grammar_checker = GrammarChecker()
        self.setup_page()
        self.job_description = ""

    def setup_page(self):
        """Configure the Streamlit page"""
        st.set_page_config(
            page_title="Resume ATS Analyzer",
            page_icon="📝",
            layout="wide"
        )
        st.title("📝 Resume ATS Analyzer")

    def extract_text_from_pdf(self, pdf_file):
        """Extract text from uploaded PDF"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(pdf_file.getvalue())
                tmp_file_path = tmp_file.name
            
            doc = fitz.open(tmp_file_path)
            text = "\n".join([page.get_text() for page in doc])
            doc.close()
            os.unlink(tmp_file_path)
            return text
        except Exception as e:
            st.error(f"Error extracting text from PDF: {str(e)}")
            return None

    def generate_hr_feedback(self, grammar_issues, font_issues, passive_issues, missing_keywords, ats_score):
        """Generate HR-style feedback based on detected resume issues"""
        feedback = []
        
        if ats_score >= 85:
            feedback.append("✅ Excellent ATS compatibility! Your resume is well-structured and optimized for ATS scanning.")
        elif ats_score >= 70:
            feedback.append("🔹 Good ATS compatibility. Some minor improvements can enhance your ATS score further.")
        else:
            feedback.append("❌ Your resume needs improvement for ATS compatibility. Consider optimizing sections and formatting.")
        
        if grammar_issues:
            feedback.append(f"⚠️ Grammar Issues: {len(grammar_issues)} detected. Revise and proofread your resume carefully.")
        
        if font_issues:
            feedback.append("🚫 Font Issues: Non-ATS-friendly fonts detected. Use standard fonts like Arial or Calibri.")
        
        if passive_issues:
            feedback.append(f"🔄 Passive Voice Usage: {len(passive_issues)} sentences use passive voice. Use active voice for a stronger impact.")
        
        if missing_keywords:
            feedback.append(f"❌ Missing JD Keywords: {len(missing_keywords)} important keywords are missing. Ensure your resume aligns with the job description.")
        
        feedback.append(f"🏆 Final ATS Score: {ats_score}% - Aim for at least 85% for better ATS performance.")
        
        return "\n\n".join(feedback)

    def analyze_resume(self, text):
        """Analyze resume ATS compatibility, grammar, font, and passive voice usage."""
        try:
            st.subheader("🏆 ATS Compatibility Analysis")
            
            required_sections = {'SUMMARY': 'Profile Summary', 'EXPERIENCE': 'Work Experience',
                                 'EDUCATION': 'Education', 'SKILLS': 'Skills'}
            
            ats_score = 100
            missing_sections = [display for sec, display in required_sections.items() if sec not in text.upper()]
            formatting_issues = []
            
            if missing_sections:
                ats_score -= len(missing_sections) * 15
            if re.search(r'[^\x00-\x7F]+', text):
                ats_score -= 10
                formatting_issues.append("Special characters detected.")
            if len(text.strip()) < 100:
                ats_score -= 20
                formatting_issues.append("Insufficient content length.")
            
            st.write("### ✅ Section Checklist")
            for sec, display in required_sections.items():
                if sec in text.upper():
                    st.success(f"✅ {display}")
                else:
                    st.error(f"❌ {display} (Missing)")
            
            grammar_issues = self.grammar_checker.check_grammar(text)
            if grammar_issues:
                ats_score -= len(grammar_issues)
                st.write("### 📝 Grammar & Spelling Issues")
                for issue in grammar_issues[:5]:
                    st.warning(f"⚠️ {issue}")
            
            font_issues = self.analyze_font(text)
            if font_issues:
                ats_score -= 5
                st.write("### 🔠 Font Issues")
                for issue in font_issues:
                    st.warning(f"⚠️ {issue}")
            
            passive_issues = self.analyze_passive_voice(text)
            if passive_issues:
                ats_score -= len(passive_issues) * 2
                st.write("### 🔄 Passive Voice Sentences (Consider Revising)")
                for issue in passive_issues[:5]:
                    st.warning(f"🔄 {issue}")
            
            jd_keywords = self._extract_keywords(self.job_description)
            resume_keywords = self._extract_keywords(text)
            missing_keywords = set(jd_keywords) - set(resume_keywords)
            ats_score = max(0, ats_score - len(missing_keywords) * 2)
            
            st.write("### 🎯 Job Description Keyword Analysis")
            if missing_keywords:
                st.error(f"❌ Missing JD Keywords: {', '.join(missing_keywords)}")
            
            st.write("## 🏅 HR Feedback & Suggestions")
            hr_feedback = self.generate_hr_feedback(grammar_issues, font_issues, passive_issues, missing_keywords, ats_score)
            st.info(hr_feedback)
            
            st.markdown(f"## 🏅 Final Resume Score: **{ats_score}%**")
            st.metric("Target Score", 85)
            
            return ats_score
        except Exception as e:
            st.error(f"Error in analysis: {str(e)}")
            return 0

    def analyze_font(self, text):
        """Dummy font analysis"""
        font_issues = []
        if "Times New Roman" in text:
            font_issues.append("🚫 Times New Roman detected - Use ATS-friendly fonts like Arial or Calibri.")
        return font_issues

    def analyze_passive_voice(self, text):
        """Detect passive voice sentences"""
        passive_phrases = ["was", "were", "has been", "have been", "had been", "will be", "is being"]
        sentences = text.split('.')
        return [sent.strip() for sent in sentences if any(phrase in sent for phrase in passive_phrases)]

    def _extract_keywords(self, text):
        """Extract keywords"""
        return set(re.findall(r'\b\w+\b', text.lower())) if text else set()

    def run(self):
        """Run the Streamlit app"""
        self.job_description = st.text_area("✍️ Paste Job Description", height=200)
        uploaded_file = st.file_uploader("Upload your resume (PDF format)", type=['pdf'])
        
        if uploaded_file:
            with st.spinner("🔍 Analyzing resume..."):
                resume_text = self.extract_text_from_pdf(uploaded_file)
                if resume_text:
                    self.analyze_resume(resume_text)

if __name__ == "__main__":
    analyzer = ResumeAnalyzer()
    analyzer.run()
