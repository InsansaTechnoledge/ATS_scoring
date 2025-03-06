# Common resume buzzwords to avoid
BUZZWORDS = [
    "team player", "detail-oriented", "proactive", "self-starter", "synergy", 
    "go-getter", "think outside the box", "results-driven", "hard worker",
    "dynamic", "thought leader", "value add", "rockstar", "guru", "ninja"
]

# Industry-specific keywords for bonus scoring

INDUSTRY_KEYWORDS = {
    "technology": ["software", "developer", "programming", "python", "java", "c++", "cloud", "data", "ai", "machine learning", "cybersecurity", "iot", "blockchain"],
    "business_finance": ["finance", "accounting", "investment", "banking", "marketing", "sales", "supply chain", "hr", "management", "strategy"],
    "healthcare": ["doctor", "nurse", "medical", "clinical", "biotech", "pharmaceutical", "health", "telemedicine"],
    "engineering": ["mechanical", "civil", "electrical", "manufacturing", "cad", "solidworks"],
    "media_creative": ["design", "graphic", "video editing", "cinematography", "content writing", "copywriting"],
    "education": ["teacher", "training", "curriculum", "e-learning"],
    "law_government": ["law", "legal", "policy", "public administration"],
    "hospitality_retail": ["hotel", "event planning", "customer service", "retail", "merchandising"]
}

    
    


# Common action verbs for bullet points
ACTION_VERBS = [
    "achieved", "analyzed", "built", "coordinated", "created", "delivered",
    "designed", "developed", "established", "implemented", "improved", "increased",
    "launched", "led", "managed", "negotiated", "organized", "reduced", "resolved",
    "streamlined", "transformed"
]



# Common words to filter out when extracting keywords
COMMON_WORDS = {
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 
    'for', 'with', 'of', 'by', 'is', 'are', 'was', 'were'
}

# Passive voice phrases
PASSIVE_PHRASES = [
    "was", "were", "has been", "have been", "had been", "will be", "shall be",
    "being", "is being", "are being", "was being", "were being"
]