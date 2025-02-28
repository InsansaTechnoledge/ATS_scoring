"""
Style rules for grammar and resume analysis.
"""
import re


class StyleRules:
    def __init__(self):
        """Load generic resume style and grammar rules that work for any format"""
        self.style_rules = {
            # Common weak verbs found in any resume
            'weak_verbs': {
                r'\bwork(ed)?\s+on\b': ['developed', 'engineered', 'implemented'],
                r'\bhelp(ed)?\b': ['led', 'coordinated', 'facilitated'],
                r'\bwas\s+responsible\s+for\b': ['managed', 'directed', 'orchestrated'],
                r'\buse(d)?\b': ['leveraged', 'utilized', 'implemented'],
                r'\bmade\b': ['created', 'developed', 'designed'],
                r'\bassist(ed)?\b': ['facilitated', 'coordinated', 'managed'],
                r'\bdo(ne)?\b': ['completed', 'executed', 'delivered'],
                r'\btry|tried\b': ['implemented', 'executed', 'achieved']
            },
            # Technical terms with correct capitalization
            'technical_terms': {
                'javascript': 'JavaScript',
                'typescript': 'TypeScript',
                'nodejs': 'Node.js',
                'reactjs': 'ReactJS',
                'react': 'React',
                'mongodb': 'MongoDB',
                'mysql': 'MySQL',
                'postgresql': 'PostgreSQL',
                'github': 'GitHub',
                'gitlab': 'GitLab',
                'api': 'API',
                'rest': 'REST',
                'aws': 'AWS',
                'docker': 'Docker',
                'kubernetes': 'Kubernetes',
                'linux': 'Linux',
                'unix': 'Unix',
                'ai': 'AI',
                'ml': 'ML',
                'css': 'CSS',
                'html': 'HTML'
            },
            # Resume sections and their variations
            'section_patterns': {
                'EDUCATION': r'(?i)(education|academic|qualification|degree|studies)',
                'EXPERIENCE': r'(?i)(experience|employment|work|career|history)',
                'SKILLS': r'(?i)(skills|expertise|competencies|proficiencies|technical)',
                'PROJECTS': r'(?i)(projects|portfolio|works)',
                'ACHIEVEMENTS': r'(?i)(achievements|accomplishments|awards|honors)',
                'CERTIFICATIONS': r'(?i)(certifications|certificates|credentials)',
                'SUMMARY': r'(?i)(summary|profile|objective|about)',
                'ACTIVITIES': r'(?i)(activities|involvement|leadership|volunteer)'
            }
        }

    def get_weak_verbs(self):
        """Get weak verbs mapping"""
        return self.style_rules['weak_verbs']

    def get_technical_terms(self):
        """Get technical terms mapping"""
        return self.style_rules['technical_terms']

    def get_section_patterns(self):
        """Get section patterns mapping"""
        return self.style_rules['section_patterns']