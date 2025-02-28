import language_tool_python
from textblob import TextBlob
import spacy

nlp = spacy.load("en_core_web_sm")

# Custom whitelist for proper nouns
# CUSTOM_PROPER_NOUNS = {"Codeforces", "Codechef", "LinkedIn"}
CUSTOM_PROPER_NOUNS = {}

def extract_proper_nouns(text):
    """Extract proper nouns using spaCy and custom whitelist."""
    doc = nlp(text)
    proper_nouns = {token.text for token in doc if token.pos_ == "PROPN"}
    return proper_nouns.union(CUSTOM_PROPER_NOUNS)

def trim_context(context, error_offset, max_length=50):
    """Trim context equally from both sides around the error location."""
    start = max(error_offset - max_length // 2, 0)
    end = min(start + max_length, len(context))
    return "..." + context[start:end].strip() + "..."

def check_text_grammar_spelling(text: str):
    tool = language_tool_python.LanguageTool('en-US')
    results = []

    # Extract proper nouns
    proper_nouns = extract_proper_nouns(text)

    # Check grammar issues using LanguageTool
    grammar_matches = tool.check(text)
    for match in grammar_matches:
        trimmed_context = trim_context(match.context, match.offset)

        # Skip grammar errors involving proper nouns
        if any(proper_noun in match.context for proper_noun in proper_nouns):
            continue

        results.append({
            "type": "Grammar",
            "context": trimmed_context,
            "issue": match.message,
            "suggestions": match.replacements
        })

    # Check spelling issues using TextBlob
    blob = TextBlob(text)
    for sentence in blob.sentences:
        corrected = sentence.correct()
        for original_word, corrected_word in zip(sentence.words, corrected.words):
            if original_word != corrected_word and original_word not in proper_nouns:
                trimmed_context = trim_context(str(sentence), str(sentence).find(original_word))
                results.append({
                    "type": "Spelling",
                    "context": trimmed_context,
                    "issue": f"Spelling mistake: '{original_word}'",
                    "suggestions": [corrected_word]
                })

    return results


if __name__ == '__main__':
    # Example text to check
    raw_text = """
    Jay Fanse
    [Codeforces] [Codechef] [LinkedIn]
    AWS Java Python MERN Stack contedt
    Career Objective: Seeking for a challenging role in reputed organisation to enhance my skills and contribute to the groth of the company.
    Education: Bachelor of Tecnology in Computer Science from Maharaja Sayajirao University with 8.5 CGPA.
    """
    results = check_text_grammar_spelling(raw_text)

    # Write results to file
    with open('grammar_demo.txt', 'w+') as f:
        for result in results:
            f.write(str(result) + "\n")

    print("Grammar check completed and saved to grammar_demo.txt")
