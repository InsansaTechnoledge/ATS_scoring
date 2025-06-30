import re
import spacy
from typing import Dict, List, Any
from data.skills_database import SkillsDatabase

class ResumeParser:
    """Parse and extract structured information from resume text"""
    
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise Exception("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
        
        self.skills_db = SkillsDatabase.get_skills()
        
    def parse_resume(self, text: str) -> Dict[str, Any]:
        """Extract structured information from resume text"""
        return {
            'contact_info': self._extract_contact_info(text),
            'skills': self._extract_skills(text),
            'experience': self._extract_experience_years(text),
            'education': self._extract_education(text),
            'sections': self._identify_sections(text),
            'keywords': self._extract_keywords(text),
            'word_count': len(text.split()),
            'bullet_points': self._count_bullet_points(text)
        }
    
    def _extract_contact_info(self, text: str) -> Dict[str, List[str]]:
        """Extract contact information"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        
        return {
            'emails': re.findall(email_pattern, text, re.IGNORECASE),
            'phones': re.findall(phone_pattern, text)
        }
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.skills_db:
            skill_lower = skill.lower()
            if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
                found_skills.append(skill)
        
        return list(set(found_skills))
    
    def _extract_experience_years(self, text: str) -> int:
        """Extract years of experience"""
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?experience',
            r'experience[:\s]*(\d+)\+?\s*years?',
        ]
        
        years = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            years.extend([int(match) for match in matches])
        
        return max(years) if years else 0
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education_keywords = [
            "Bachelor", "Master", "PhD", "Doctorate", "Associate",
            "B.S.", "B.A.", "M.S.", "M.A.", "MBA", "B.Tech", "M.Tech"
        ]
        
        found_education = []
        for keyword in education_keywords:
            if keyword.lower() in text.lower():
                found_education.append(keyword)
        
        return found_education
    
    def _identify_sections(self, text: str) -> List[str]:
        """Identify common resume sections"""
        section_patterns = {
            'experience': r'(?:work\s+)?experience|employment|professional\s+background',
            'education': r'education|academic|qualifications',
            'skills': r'skills|technical\s+skills|competencies|expertise',
            'projects': r'projects|portfolio',
            'certifications': r'certifications?|certificates?',
            'achievements': r'achievements?|accomplishments?|awards?'
        }
        
        found_sections = []
        for section, pattern in section_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                found_sections.append(section)
        
        return found_sections
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords using NLP"""
        doc = self.nlp(text)
        keywords = []
        
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'TECHNOLOGY']:
                keywords.append(ent.text)
        
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 3:
                keywords.append(chunk.text)
        
        return list(set(keywords))
    
    def _count_bullet_points(self, text: str) -> int:
        """Count bullet points in resume"""
        bullet_patterns = [r'^\s*[•·▪▫‣⁃]\s', r'^\s*[-*]\s', r'^\s*\d+\.\s']
        
        lines = text.split('\n')
        bullet_count = 0
        
        for line in lines:
            for pattern in bullet_patterns:
                if re.match(pattern, line):
                    bullet_count += 1
                    break
        
        return bullet_count