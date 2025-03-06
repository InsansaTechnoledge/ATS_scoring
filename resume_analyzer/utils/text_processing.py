import re
from collections import Counter
from utils.constants import COMMON_WORDS, PASSIVE_PHRASES

def extract_keywords(text: str):

    """Extract meaningful keywords from text, filtering out common words"""
    if not text:
        return set()
    
    # Extract words of at least 3 characters (avoiding short filler words)
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())

    # Remove common words (stopwords)
    filtered_words = [word for word in words if word not in COMMON_WORDS]

    # Use a set to ensure uniqueness
    return set(filtered_words)


def analyze_passive_voice(text):
    """Identify passive voice constructions in text"""
    sentences = text.split('.')
    passive_sentences = []
    
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
            
        words = sent.lower().split()
        if any(phrase in words for phrase in PASSIVE_PHRASES):
            # More accurately check if it's truly passive voice
            if any(re.search(r'\b(was|were|been|be) [a-zA-Z]+ed\b', sent.lower())):
                passive_sentences.append(sent)
                
    return passive_sentences

def detect_formatting_issues(text):
    """Identify potential formatting issues in text"""
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

def detect_industry(text, industry_keywords):
    """Detect the industry based on keyword frequency"""
    text_lower = text.lower()
    
    industry_scores = {}
    for industry, keywords in industry_keywords.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        industry_scores[industry] = matches
        
    if not industry_scores:
        return None
        
    # Return the industry with the highest score
    return max(industry_scores.items(), key=lambda x: x[1])[0]