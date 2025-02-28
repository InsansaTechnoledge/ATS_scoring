"""
Section analyzer for detecting and processing resume sections.
"""
import re
import logging
from typing import Dict

from Grammar.core.style_rules import StyleRules


class SectionAnalyzer:
    def __init__(self, style_rules: StyleRules):
        """Initialize the section analyzer"""
        self.style_rules = style_rules

    def detect_resume_sections(self, text: str) -> Dict[str, str]:
        """Intelligently detect resume sections regardless of format"""
        sections = {}
        lines = text.split('\n')
        current_section = 'OTHER'
        current_content = []
        
        try:
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Check if line is a section header
                section_found = False
                for section, pattern in self.style_rules.get_section_patterns().items():
                    if re.search(pattern, line, re.IGNORECASE) and len(line) < 50:
                        if current_content:
                            sections[current_section] = '\n'.join(current_content)
                        current_section = section
                        current_content = []
                        section_found = True
                        break
                
                if not section_found:
                    current_content.append(line)
            
            # Add last section
            if current_content:
                sections[current_section] = '\n'.join(current_content)
                
            return sections
        except Exception as e:
            logging.error(f"Error detecting resume sections: {str(e)}")
            return {'OTHER': text}