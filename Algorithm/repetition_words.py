import re
import PyPDF2
import docx
import tkinter as tk
from tkinter import filedialog, scrolledtext
from collections import Counter

# List of keywords to highlight
skills_keywords = ['Python', 'Machine Learning', 'SQL', 'Data Science', 'Java', 'C++', 'SAP', "SAP ABAP", "SAP HANA"]

stopwords = {"and", "in", "to", "a", "of", "the", "on", "for", "with", "at", "by", "2024", "06", "is", "an", "it", "05", "data", "patel"}

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    text = ""
    with open(pdf_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(docx_path):
    """Extracts text from a Word file."""
    doc = docx.Document(docx_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def count_word_frequency(text):
    """Counts word occurrences while ignoring common words (stopwords)."""
    words = re.findall(r'\b\w+\b', text)  # Extract words without converting to lowercase
    word_counts = Counter(word.lower() for word in words if word.lower() not in stopwords)  # Exclude stopwords
    return word_counts

def open_file():
    """Opens a file dialog to upload a resume and process it."""
    file_path = filedialog.askopenfilename()

    if not file_path:
        return  # If no file is selected, do nothing

    # Check if the file format is valid
    if not (file_path.endswith(".pdf") or file_path.endswith(".docx")):
        result_box.config(state=tk.NORMAL)
        result_box.delete("1.0", tk.END)
        result_box.insert(tk.END, "Invalid format! Please upload a PDF or Word file.\n")
        result_box.config(state=tk.DISABLED)
        return  # Stop further execution if the format is invalid

    # Extract text based on file type
    if file_path.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        extracted_text = extract_text_from_docx(file_path)

    # Count word frequencies
    word_counts = count_word_frequency(extracted_text)
    most_common_words = word_counts.most_common(10)  # Show top 10 repeated words

    # Display results in GUI
    result_box.config(state=tk.NORMAL)  # Enable editing
    result_box.delete("1.0", tk.END)  # Clear previous text
    result_box.insert(tk.END, "=== Top 10 Repeated Words ===\n", "bold")
    
    for word, count in most_common_words:
        result_box.insert(tk.END, f"{word}: {count}\n")

    result_box.config(state=tk.DISABLED)  # Disable editing

# GUI Setup
root = tk.Tk()
root.title("Resume Analyzer")

upload_button = tk.Button(root, text="Upload Resume", command=open_file)
upload_button.pack(pady=10)

result_box = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=80, height=30)
result_box.pack(padx=10, pady=10)
result_box.tag_config("bold", font=("Arial", 10, "bold"))
result_box.config(state=tk.DISABLED)

root.mainloop()