# Common resume buzzwords to avoid
BUZZWORDS = [
    "team player", "detail-oriented", "proactive", "self-starter", "synergy", 
    "go-getter", "think outside the box", "results-driven", "hard worker",
    "dynamic", "thought leader", "value add", "rockstar", "guru", "ninja"
]

# Industry-specific keywords for bonus scoring
INDUSTRY_KEYWORDS = {
    "software": ["python", "java", "javascript", "react", "nodejs", "sql", "cloud", "aws", "azure", "devops"],
    "finance": ["accounting", "financial", "budget", "investment", "asset", "portfolio", "banking", "trading"],
    "marketing": ["campaign", "digital marketing", "seo", "content", "social media", "analytics", "branding"],
    "healthcare": ["clinical", "patient", "medical", "healthcare", "hospital", "physician", "treatment"]
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