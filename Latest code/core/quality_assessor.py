import nltk
import language_tool_python
from typing import Dict, List, Any
from models.scoring_result import ScoringResult
import re

class ResumeQualityAssessor:
    """Assess general resume quality without job description"""
    
    def __init__(self):
        try:
            self.grammar_tool = language_tool_python.LanguageTool('en-US')
        except:
            self.grammar_tool = None
            print("Warning: LanguageTool not available. Grammar checking disabled.")
    
    def assess_quality(self, text: str, resume_data: Dict[str, Any]) -> ScoringResult:
        """Assess overall resume quality"""
        scores = {}
        feedback = []
        recommendations = []
        
        # Format and structure (25% weight)
        format_score = self._assess_format_structure(text, resume_data)
        scores['format_structure'] = format_score
        
        # Content quality (25% weight)
        content_score = self._assess_content_quality(text, resume_data)
        scores['content_quality'] = content_score
        
        # Grammar and language (25% weight)
        grammar_score = self._assess_grammar(text)
        scores['grammar_language'] = grammar_score
        
        # Completeness (25% weight)
        completeness_score = self._assess_completeness(resume_data)
        scores['completeness'] = completeness_score
        
        # Generate comprehensive feedback and recommendations
        self._generate_comprehensive_feedback(scores, feedback, recommendations, text, resume_data)
        
        # Calculate overall score - scale to medium range (50-80) for quality assessment
        base_score = sum(scores.values()) / len(scores)
        overall_score = 50 + (base_score * 30)  # Scale to 50-80 range
        
        return ScoringResult(
            overall_score=overall_score,
            scoring_type='quality_assessment',
            breakdown={k: v * 100 for k, v in scores.items()},
            feedback=feedback,
            recommendations=recommendations
        )
    
    def _assess_format_structure(self, text: str, resume_data: Dict) -> float:
        """Assess resume format and structure"""
        score = 0.0
        
        # Check for proper sections
        required_sections = ['experience', 'education', 'skills']
        found_sections = resume_data.get('sections', [])
        section_score = len(set(required_sections) & set(found_sections)) / len(required_sections)
        score += section_score * 0.4
        
        # Check for bullet points usage
        bullet_count = resume_data.get('bullet_points', 0)
        if bullet_count > 5:
            score += 0.3
        elif bullet_count > 0:
            score += 0.15
        
        # Check length (should be reasonable)
        word_count = resume_data.get('word_count', 0)
        if 300 <= word_count <= 800:
            score += 0.3
        elif 200 <= word_count <= 1000:
            score += 0.15
        
        return min(score, 1.0)
    
    def _assess_content_quality(self, text: str, resume_data: Dict) -> float:
        """Assess content quality"""
        score = 0.0
        
        # Skills diversity
        skills_count = len(resume_data.get('skills', []))
        if skills_count >= 10:
            score += 0.3
        elif skills_count >= 5:
            score += 0.2
        elif skills_count >= 1:
            score += 0.1
        
        # Contact information presence
        contact_info = resume_data.get('contact_info', {})
        if contact_info.get('emails') and contact_info.get('phones'):
            score += 0.2
        elif contact_info.get('emails') or contact_info.get('phones'):
            score += 0.1
        
        # Experience information
        if resume_data.get('experience', 0) > 0:
            score += 0.2
        
        # Education information
        if resume_data.get('education'):
            score += 0.2
        
        # Keywords richness
        keywords_count = len(resume_data.get('keywords', []))
        if keywords_count >= 20:
            score += 0.1
        elif keywords_count >= 10:
            score += 0.05
        
        return min(score, 1.0)
    
    def _assess_grammar(self, text: str) -> float:
        """Assess grammar and language quality"""
        if not self.grammar_tool:
            return 0.8
        
        try:
            text_sample = text[:2000] if len(text) > 2000 else text
            matches = self.grammar_tool.check(text_sample)
            
            sentences = nltk.sent_tokenize(text_sample)
            sentence_count = len(sentences)
            
            if sentence_count == 0:
                return 0.0
            
            error_rate = len(matches) / sentence_count
            
            if error_rate == 0:
                return 1.0
            elif error_rate <= 0.1:
                return 0.9
            elif error_rate <= 0.2:
                return 0.7
            elif error_rate <= 0.3:
                return 0.5
            else:
                return 0.3
                
        except Exception:
            return 0.8
    
    def _assess_completeness(self, resume_data: Dict) -> float:
        """Assess resume completeness"""
        score = 0.0
        
        components = {
            'contact_info': 0.3,
            'skills': 0.3,
            'experience': 0.2,
            'education': 0.2
        }
        
        for component, weight in components.items():
            if component == 'contact_info':
                if resume_data.get(component, {}).get('emails'):
                    score += weight
            elif resume_data.get(component):
                score += weight
        
        return score
    
    def _generate_comprehensive_feedback(self, scores: Dict[str, float], feedback: List[str], 
                                       recommendations: List[str], text: str, resume_data: Dict):
        """Generate comprehensive feedback and recommendations based on scores and content analysis"""
        
        # Format and Structure Feedback
        format_score = scores['format_structure']
        if format_score >= 0.8:
            feedback.append("Excellent resume structure and formatting")
        elif format_score >= 0.6:
            feedback.append("Good resume structure with room for minor improvements")
            recommendations.append("Consider adding more bullet points to highlight key achievements")
        else:
            feedback.append("Resume structure needs significant improvement")
            recommendations.append("Reorganize resume with clear sections: Contact, Summary, Experience, Education, Skills")
            recommendations.append("Use consistent formatting and bullet points throughout")
            recommendations.append("Ensure proper spacing and visual hierarchy")
        
        # Word count specific feedback
        word_count = resume_data.get('word_count', 0)
        if word_count < 200:
            feedback.append("Resume content is too brief")
            recommendations.append("Expand on work experience with specific achievements and responsibilities")
            recommendations.append("Add more detailed skill descriptions and project examples")
        elif word_count > 1000:
            feedback.append("Resume content is too lengthy")
            recommendations.append("Condense information to essential details only")
            recommendations.append("Remove redundant phrases and focus on key accomplishments")
        
        # Bullet points feedback
        bullet_count = resume_data.get('bullet_points', 0)
        if bullet_count < 3:
            feedback.append("Insufficient use of bullet points")
            recommendations.append("Use bullet points to list achievements and responsibilities")
            recommendations.append("Start each bullet point with strong action verbs")
        
        # Content Quality Feedback
        content_score = scores['content_quality']
        if content_score >= 0.8:
            feedback.append("High-quality content with comprehensive information")
        elif content_score >= 0.6:
            feedback.append("Good content quality with some areas for enhancement")
        else:
            feedback.append("Content quality needs improvement")
            recommendations.append("Add more relevant professional skills")
            recommendations.append("Include quantifiable achievements with numbers and percentages")
            recommendations.append("Describe impact of your work with specific examples")
        
        # Skills-specific feedback
        skills_count = len(resume_data.get('skills', []))
        if skills_count < 5:
            feedback.append("Limited skills listed")
            recommendations.append("Add both technical and soft skills relevant to your field")
            recommendations.append("Include industry-specific tools and technologies")
            recommendations.append("Mention certifications and specialized knowledge")
        elif skills_count > 20:
            feedback.append("Consider focusing on most relevant skills")
            recommendations.append("Prioritize skills most relevant to your target positions")
            recommendations.append("Group similar skills into categories")
        
        # Contact Information Feedback
        contact_info = resume_data.get('contact_info', {})
        if not contact_info.get('emails'):
            feedback.append("Missing email contact information")
            recommendations.append("Add a professional email address")
        if not contact_info.get('phones'):
            feedback.append("Missing phone contact information")
            recommendations.append("Include a professional phone number")
        
        # Grammar and Language Feedback
        grammar_score = scores['grammar_language']
        if grammar_score >= 0.9:
            feedback.append("Excellent grammar and language usage")
        elif grammar_score >= 0.7:
            feedback.append("Good grammar with minor errors")
            recommendations.append("Proofread carefully for remaining grammar issues")
            recommendations.append("Consider using grammar checking tools")
        else:
            feedback.append("Grammar and language need significant attention")
            recommendations.append("Thoroughly proofread for grammar, spelling, and punctuation errors")
            recommendations.append("Use professional language and avoid informal expressions")
            recommendations.append("Ensure consistent verb tenses throughout")
            recommendations.append("Consider having someone else review your resume")
        
        # Completeness Feedback
        completeness_score = scores['completeness']
        if completeness_score >= 0.9:
            feedback.append("Resume contains all essential information")
        elif completeness_score >= 0.7:
            feedback.append("Resume is mostly complete with minor gaps")
        else:
            feedback.append("Resume is missing critical information")
            recommendations.append("Include complete contact information (email, phone, location)")
            recommendations.append("Add detailed work experience with dates and achievements")
            recommendations.append("Include education details with degrees and institutions")
            recommendations.append("Add a professional summary or objective statement")
        
        # Additional content analysis
        self._analyze_content_patterns(text, feedback, recommendations)
        
        # Experience-specific feedback
        experience_years = resume_data.get('experience_years', 0)
        if experience_years == 0:
            recommendations.append("Include internships, projects, or volunteer work if lacking professional experience")
            recommendations.append("Highlight academic projects and relevant coursework")
        elif experience_years > 10:
            recommendations.append("Focus on most recent and relevant positions")
            recommendations.append("Emphasize leadership roles and career progression")
        
        # Section-specific recommendations
        sections = resume_data.get('sections', [])
        missing_sections = []
        
        if 'summary' not in [s.lower() for s in sections]:
            missing_sections.append('Professional Summary')
        if 'projects' not in [s.lower() for s in sections] and experience_years < 3:
            missing_sections.append('Projects')
        if 'certifications' not in [s.lower() for s in sections]:
            missing_sections.append('Certifications (if applicable)')
        
        if missing_sections:
            recommendations.append(f"Consider adding these sections: {', '.join(missing_sections)}")
    
    def _analyze_content_patterns(self, text: str, feedback: List[str], recommendations: List[str]):
        """Analyze text patterns for additional insights"""
        
        # Check for quantifiable achievements
        numbers_pattern = r'\b\d+[%\w]*\b'
        numbers_found = len(re.findall(numbers_pattern, text))
        
        if numbers_found < 3:
            feedback.append("Limited use of quantifiable achievements")
            recommendations.append("Include specific numbers, percentages, and metrics to demonstrate impact")
            recommendations.append("Examples: 'Increased sales by 25%', 'Managed team of 10 people'")
        
        # Check for action verbs
        action_verbs = ['achieved', 'managed', 'led', 'developed', 'created', 'improved', 
                       'increased', 'reduced', 'implemented', 'designed', 'built', 'launched']
        action_verb_count = sum(1 for verb in action_verbs if verb.lower() in text.lower())
        
        if action_verb_count < 5:
            feedback.append("Use more strong action verbs")
            recommendations.append("Start bullet points with powerful action verbs")
            recommendations.append("Examples: Led, Achieved, Developed, Implemented, Optimized")
        
        # Check for personal pronouns (should be minimal in resumes)
        personal_pronouns = ['i ', 'me ', 'my ', 'mine ', 'myself ']
        pronoun_count = sum(text.lower().count(pronoun) for pronoun in personal_pronouns)
        
        if pronoun_count > 3:
            feedback.append("Excessive use of personal pronouns")
            recommendations.append("Avoid using 'I', 'me', 'my' - use action-oriented statements instead")
            recommendations.append("Example: Change 'I managed a team' to 'Managed team of 5 developers'")
        
        # Check for buzzwords and clichés
        buzzwords = ['synergy', 'leverage', 'dynamic', 'innovative', 'detail-oriented', 
                    'team player', 'hard worker', 'go-getter']
        buzzword_count = sum(1 for word in buzzwords if word.lower() in text.lower())
        
        if buzzword_count > 2:
            feedback.append("Consider reducing generic buzzwords")
            recommendations.append("Replace vague terms with specific skills and achievements")
            recommendations.append("Show don't tell - provide concrete examples instead of claims")
        
        # Check resume length appropriateness
        if len(text.split()) > 600:
            recommendations.append("Consider condensing content for better readability")
        elif len(text.split()) < 150:
            recommendations.append("Expand content with more specific details and examples")