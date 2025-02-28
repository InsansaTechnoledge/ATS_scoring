# test.py

import streamlit as st
import fitz  # PyMuPDF
from Grammar.grammar_checker import GrammarChecker
import pandas as pd
import plotly.express as px
import json
import tempfile
import os
from datetime import datetime
import re
from typing import Dict, List, Union  # Add this import

class ResumeAnalyzer:
    def __init__(self):
        self.grammar_checker = GrammarChecker()
        self.setup_page()
        
    def setup_page(self):
        """Configure the Streamlit page"""
        st.set_page_config(
            page_title="Resume Grammar Checker",
            page_icon="📝",
            layout="wide"
        )
        st.title("📝 Resume Grammar & ATS Analysis")
        
    def extract_text_from_pdf(self, pdf_file):
        """Extract text from uploaded PDF"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(pdf_file.getvalue())
                tmp_file_path = tmp_file.name

            doc = fitz.open(tmp_file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            os.unlink(tmp_file_path)
            return text
        except Exception as e:
            st.error(f"Error extracting text from PDF: {str(e)}")
            return None

    def analyze_grammar(self, text):
        """Analyze grammar for any resume format"""
        try:
            issues = self.grammar_checker.check_grammar(text)
            sections = self.grammar_checker._detect_resume_sections(text)

            # Display issues by section in collapsible containers
            if issues:
                st.write("### Grammar Issues by Section")
                
                # Group issues by section
                section_issues = {}
                for issue in issues:
                    section = issue.get('section', 'General')
                    if section not in section_issues:
                        section_issues[section] = []
                    section_issues[section].append(issue)
                
                # Display each section's issues
                for section, section_issues_list in section_issues.items():
                    with st.expander(f"📋 {section} ({len(section_issues_list)} issues)"):
                        for issue in section_issues_list:
                            col1, col2 = st.columns([1, 3])
                            with col1:
                                st.error(issue['category'])
                            with col2:
                                st.markdown(f"**Found:** {issue['error']}")
                                if issue['suggestions']:
                                    st.markdown(f"**Suggestion:** {', '.join(issue['suggestions'])}")
                            st.markdown("---")
            else:
                st.success("✅ No major grammar issues found!")
            
            # Check and display passive voice usage
            passive_sentences = self.grammar_checker.check_passive_voice(text)
            if passive_sentences:
                st.write("### Passive Voice Detected")
                with st.expander("🔄 Passive Voice Improvements", expanded=True):
                    for sentence in passive_sentences:
                        col1, col2 = st.columns([1, 1])
                        with col1:
                            st.warning("**Original (Passive):**")
                            st.markdown(f"> {sentence}")
                        with col2:
                            st.success("**Suggested (Active):**")
                            active = self._convert_to_active(sentence)
                            st.markdown(f"> {active}")
            
            # Technical terms analysis
            tech_terms = self._analyze_technical_terms(text)
            if tech_terms['incorrect']:
                st.write("### Technical Term Usage")
                with st.expander("💻 Technical Term Improvements"):
                    for term, correct in tech_terms['incorrect'].items():
                        st.info(f"Replace '{term}' with '{correct}' for correct technical usage")
            
            # Action verb analysis
            weak_verbs = self._analyze_action_verbs(text)
            if weak_verbs:
                st.write("### Action Verb Improvements")
                with st.expander("💪 Strengthen Your Action Verbs"):
                    for verb, suggestions in weak_verbs.items():
                        st.warning(f"Consider replacing '{verb}' with: {', '.join(suggestions)}")

        except Exception as e:
            st.error(f"Error analyzing grammar: {str(e)}")

    def _convert_to_active(self, passive_sentence: str) -> str:
        """Convert passive voice to active voice"""
        # Common passive patterns and their active alternatives
        patterns = {
            r'is used to': 'uses',
            r'are maintained': 'maintains',
            r'is implemented': 'implements',
            r'are developed': 'develops',
            r'is managed': 'manages',
            r'was created': 'created',
            r'were developed': 'developed',
            r'was designed': 'designed',
            r'were implemented': 'implemented',
            r'is performed': 'performs',
            r'was built': 'built',
            r'is done': 'does',
            r'was generated': 'generated',
            r'are used': 'uses',
            r'is handled': 'handles'
        }
        
        active = passive_sentence
        for passive, active_verb in patterns.items():
            active = re.sub(passive, active_verb, active, flags=re.IGNORECASE)
        return active

    def _analyze_technical_terms(self, text: str) -> Dict:
        """Analyze technical term usage"""
        result = {'correct': {}, 'incorrect': {}}
        
        for term, correct in self.grammar_checker.style_rules['technical_terms'].items():
            if re.search(r'\b' + term + r'\b', text, re.IGNORECASE):
                if not re.search(r'\b' + correct + r'\b', text):
                    result['incorrect'][term] = correct
                else:
                    result['correct'][term] = correct
                    
        return result

    def _analyze_action_verbs(self, text: str) -> Dict:
        """Analyze action verb usage"""
        weak_verbs = {}
        
        for pattern, replacements in self.grammar_checker.style_rules['weak_verbs'].items():
            if re.search(pattern, text, re.IGNORECASE):
                weak_verbs[pattern] = replacements
                
        return weak_verbs
    def analyze_readability(self, text):
        """Analyze resume readability"""
        try:
            scores = self.grammar_checker.analyze_readability(text)
            
            # Create DataFrame for visualization
            df = pd.DataFrame({
                'Metric': list(scores.keys()),
                'Score': list(scores.values())
            })
            
            st.write("### Readability Analysis")
            
            # Create bar chart using plotly
            fig = px.bar(
                df,
                x='Metric',
                y='Score',
                title='Resume Readability Metrics',
                color='Score',
                color_continuous_scale='RdYlBu'
            )
            fig.update_layout(
                xaxis_tickangle=-45,
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Add interpretations
            flesch_score = scores.get('Flesch Reading Ease', 0)
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Overall Readability", 
                         f"{flesch_score:.1f}",
                         delta="Target: 60-70")
            
            with col2:
                st.metric("Technical Terms",
                         f"{scores.get('Difficult Words', 0)}",
                         delta="Target: 15-25%")
                
            with col3:
                st.metric("Average Complexity",
                         f"{scores.get('Gunning Fog Index', 0):.1f}",
                         delta="Target: 10-12")
            
            # Add readability feedback
            st.write("### Readability Feedback")
            if flesch_score > 70:
                st.success("✅ Your resume is very easy to read")
            elif flesch_score > 60:
                st.success("✅ Your resume has good readability")
            elif flesch_score > 50:
                st.warning("⚠️ Your resume is slightly difficult to read")
            else:
                st.error("❌ Your resume might be too complex")
                
        except Exception as e:
            st.error(f"Error analyzing readability: {str(e)}")

    def analyze_ats_compatibility(self, text):
        """Analyze ATS compatibility"""
        try:
            st.write("### ATS Compatibility Analysis")
            
            # Check section presence
            sections = self.grammar_checker._detect_resume_sections(text)
            required_sections = {
                'SUMMARY': 'Profile Summary',
                'EXPERIENCE': 'Work Experience',
                'EDUCATION': 'Education',
                'SKILLS': 'Skills'
            }
            
            # Calculate ATS score
            ats_score = 100
            missing_sections = []
            formatting_issues = []
            
            # Check sections and reduce score for missing ones
            for section, display_name in required_sections.items():
                if section not in sections:
                    ats_score -= 15
                    missing_sections.append(display_name)
            
            # Check formatting issues
            if re.search(r'[^\x00-\x7F]+', text):
                ats_score -= 10
                formatting_issues.append("Special characters detected")
                
            if len(text.strip()) < 100:
                ats_score -= 20
                formatting_issues.append("Insufficient content length")
            
            # Display ATS Score
            st.markdown(f"### ATS Score: {max(0, ats_score)}%")
            score_color = "green" if ats_score >= 80 else "orange" if ats_score >= 60 else "red"
            st.markdown(f"<div style='width:100%; height:20px; background-color:lightgrey; border-radius:10px;'>"
                       f"<div style='width:{max(0, ats_score)}%; height:100%; background-color:{score_color}; "
                       f"border-radius:10px;'></div></div>", unsafe_allow_html=True)
            
            # Create two columns
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("#### Section Checklist")
                for section, display_name in required_sections.items():
                    if section in sections:
                        st.success(f"✅ {display_name}")
                    else:
                        st.error(f"❌ {display_name} (Missing)")
            
            with col2:
                st.write("#### Format Analysis")
                
                # Check file compatibility
                st.success("✅ PDF format detected")
                
                # Check text extraction
                if len(text.strip()) > 0:
                    st.success("✅ Text is extractable")
                else:
                    st.error("❌ Text extraction issues")
                
                # Check for special characters
                if re.search(r'[^\x00-\x7F]+', text):
                    st.warning("⚠️ Contains special characters")
                else:
                    st.success("✅ No special character issues")
            
            # Display improvement suggestions
            if missing_sections or formatting_issues:
                st.write("#### Improvement Suggestions")
                
                if missing_sections:
                    st.warning("Missing Sections:")
                    for section in missing_sections:
                        st.markdown(f"- Add {section} section to improve ATS compatibility")
                
                if formatting_issues:
                    st.warning("Formatting Issues:")
                    for issue in formatting_issues:
                        st.markdown(f"- {issue}")
                        
            # Keyword Analysis
            st.write("#### Keyword Analysis")
            # Extract common job-related keywords
            keywords = self._extract_keywords(text)
            if keywords:
                st.write("Detected Keywords:")
                keyword_text = ", ".join(keywords)
                st.info(keyword_text)
            else:
                st.warning("No significant keywords detected")
                
        except Exception as e:
            st.error(f"Error in ATS analysis: {str(e)}")

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        # Common technical and professional keywords
        common_keywords = {
            'python', 'java', 'javascript', 'react', 'node.js', 'sql',
            'project management', 'leadership', 'development', 'analysis',
            'testing', 'optimization', 'implementation', 'coordination',
            'database', 'cloud', 'aws', 'azure', 'devops', 'agile'
        }
        
        # Find matches in text
        words = set(word.lower() for word in re.findall(r'\b\w+\b', text))
        return list(words.intersection(common_keywords))

    def run(self):
        """Run the Streamlit app"""
        # Add file uploader
        uploaded_file = st.file_uploader("Upload your resume (PDF format)", type=['pdf'])
        
        if uploaded_file:
            with st.spinner("Analyzing resume..."):
                # Extract text from PDF
                resume_text = self.extract_text_from_pdf(uploaded_file)
                
                if resume_text:
                    # Create tabs for analysis
                    tab1, tab2, tab3 = st.tabs([
                        "Grammar & Style",
                        "Readability",
                        "ATS Optimization"
                    ])
                    
                    with tab1:
                        self.analyze_grammar(resume_text)
                    
                    with tab2:
                        self.analyze_readability(resume_text)
                    
                    with tab3:
                        self.analyze_ats_compatibility(resume_text)
                    
                    # Add download button for analysis report
                    try:
                        report = {
                            "filename": uploaded_file.name,
                            "timestamp": datetime.now().isoformat(),
                            "grammar_issues": self.grammar_checker.check_grammar(resume_text),
                            "readability_scores": self.grammar_checker.analyze_readability(resume_text),
                            "suggestions": self.grammar_checker.get_improvement_suggestions(resume_text),
                            "ats_analysis": {
                                "keywords": self._extract_keywords(resume_text),
                                "missing_sections": [s for s in {'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS'} 
                                                   if s not in self.grammar_checker._detect_resume_sections(resume_text)]
                            }
                        }
                        
                        st.download_button(
                            label="📥 Download Analysis Report",
                            data=json.dumps(report, indent=2),
                            file_name="resume_analysis_report.json",
                            mime="application/json"
                        )
                    except Exception as e:
                        st.error(f"Error creating report: {str(e)}")

if __name__ == "__main__":
    analyzer = ResumeAnalyzer()
    analyzer.run()