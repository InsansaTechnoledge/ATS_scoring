import re
from typing import Dict, List, Tuple

class ResumeValidator:
    """Validate if a document is actually a resume/CV"""
    
    def __init__(self):
        # Common resume sections
        self.resume_sections = [
            'experience', 'work experience', 'employment', 'professional experience',
            'education', 'academic background', 'qualifications',
            'skills', 'technical skills', 'core competencies', 'abilities',
            'contact', 'contact information', 'personal information',
            'summary', 'profile', 'objective', 'career objective',
            'certifications', 'certificates', 'achievements', 'accomplishments',
            'projects', 'personal projects', 'work history', 'employment history'
        ]
        
        # Resume-specific keywords
        self.resume_keywords = [
            'resume', 'cv', 'curriculum vitae', 'years of experience',
            'responsible for', 'managed', 'developed', 'implemented',
            'bachelor', 'master', 'degree', 'university', 'college',
            'phone', 'email', 'address', 'linkedin', 'portfolio'
        ]
        
        # Non-resume document indicators
        self.non_resume_indicators = [
            'article', 'chapter', 'abstract', 'conclusion', 'bibliography',
            'references cited', 'methodology', 'literature review',
            'invoice', 'receipt', 'statement', 'bill', 'payment',
            'contract', 'agreement', 'terms and conditions',
            'memo', 'memorandum', 'meeting minutes', 'agenda',
            'manual', 'guide', 'instructions', 'tutorial',
            'report', 'analysis', 'findings', 'research'
        ]
    
    def is_resume(self, text: str, resume_data: Dict) -> Tuple[bool, str, float]:
        """
        Validate if the document is a resume
        
        Returns:
            Tuple[bool, str, float]: (is_resume, reason, confidence_score)
        """
        if not text or len(text.strip()) < 50:
            return False, "Document too short to be a resume", 0.0
        
        text_lower = text.lower()
        confidence_score = 0.0
        reasons = []
        
        # Check for resume sections (40% weight)
        section_score = self._check_resume_sections(text_lower, resume_data)
        confidence_score += section_score * 0.4
        if section_score > 0.3:
            reasons.append(f"Contains resume sections (score: {section_score:.2f})")
        
        # Check for resume keywords (25% weight)
        keyword_score = self._check_resume_keywords(text_lower)
        confidence_score += keyword_score * 0.25
        if keyword_score > 0.2:
            reasons.append(f"Contains resume keywords (score: {keyword_score:.2f})")
        
        # Check for contact information (20% weight)
        contact_score = self._check_contact_info(resume_data)
        confidence_score += contact_score * 0.2
        if contact_score > 0.5:
            reasons.append(f"Contains contact information (score: {contact_score:.2f})")
        
        # Check for non-resume indicators (negative weight)
        non_resume_score = self._check_non_resume_indicators(text_lower)
        confidence_score -= non_resume_score * 0.3
        if non_resume_score > 0.3:
            reasons.append(f"Contains non-resume indicators (penalty: {non_resume_score:.2f})")
        
        # Check document structure (15% weight)
        structure_score = self._check_document_structure(text, resume_data)
        confidence_score += structure_score * 0.15
        if structure_score > 0.3:
            reasons.append(f"Has resume-like structure (score: {structure_score:.2f})")
        
        # Ensure score is between 0 and 1
        confidence_score = max(0.0, min(1.0, confidence_score))
        
        # Decision threshold
        is_resume = confidence_score >= 0.4
        
        reason = "; ".join(reasons) if reasons else "Insufficient resume indicators found"
        
        return is_resume, reason, confidence_score
    
    def _check_resume_sections(self, text_lower: str, resume_data: Dict) -> float:
        """Check for presence of typical resume sections"""
        found_sections = 0
        total_sections = len(self.resume_sections)
        
        # Check explicitly identified sections
        identified_sections = resume_data.get('sections', [])
        resume_section_matches = sum(1 for section in identified_sections 
                                   if any(rs in section.lower() for rs in self.resume_sections))
        
        # Check text for section keywords
        text_section_matches = sum(1 for section in self.resume_sections 
                                 if section in text_lower)
        
        found_sections = max(resume_section_matches, text_section_matches)
        
        return min(found_sections / 5, 1.0)  # Normalize to max 1.0, expecting at least 5 sections
    
    def _check_resume_keywords(self, text_lower: str) -> float:
        """Check for resume-specific keywords"""
        found_keywords = sum(1 for keyword in self.resume_keywords 
                           if keyword in text_lower)
        
        return min(found_keywords / 8, 1.0)  # Normalize, expecting at least 8 keywords
    
    def _check_contact_info(self, resume_data: Dict) -> float:
        """Check for contact information"""
        contact_info = resume_data.get('contact_info', {})
        score = 0.0
        
        if contact_info.get('emails'):
            score += 0.4
        if contact_info.get('phones'):
            score += 0.4
        if contact_info.get('addresses'):
            score += 0.2
        
        return score
    
    def _check_non_resume_indicators(self, text_lower: str) -> float:
        """Check for indicators that this is NOT a resume"""
        found_indicators = sum(1 for indicator in self.non_resume_indicators 
                             if indicator in text_lower)
        
        return min(found_indicators / 3, 1.0)  # Normalize
    
    def _check_document_structure(self, text: str, resume_data: Dict) -> float:
        """Check if document has resume-like structure"""
        score = 0.0
        
        # Check word count (resumes are typically 200-2000 words)
        word_count = resume_data.get('word_count', 0)
        if 200 <= word_count <= 2000:
            score += 0.3
        elif 100 <= word_count <= 3000:
            score += 0.1
        
        # Check for bullet points (common in resumes)
        bullet_count = resume_data.get('bullet_points', 0)
        if bullet_count > 5:
            score += 0.3
        elif bullet_count > 0:
            score += 0.1
        
        # Check for skills (important resume component)
        skills_count = len(resume_data.get('skills', []))
        if skills_count > 3:
            score += 0.4
        elif skills_count > 0:
            score += 0.2
        
        return score