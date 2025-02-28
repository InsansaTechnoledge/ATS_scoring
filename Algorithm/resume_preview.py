from docx import Document
import re
import fitz  # PyMuPDF

class ATSFormatChecker:
    def __init__(self, file_path):
        self.file_path = file_path

    def extract_resume_data(self):
        """
        Extracts key sections like Contact, Skills, Experience, Education from a resume
        (either .docx or .pdf) and returns them in a structured format.
        """
        if self.file_path.endswith('.docx'):
            resume_text = self.extract_text_from_docx()
        elif self.file_path.endswith('.pdf'):
            resume_text = self.extract_text_from_pdf()
        else:
            raise ValueError("Unsupported file format. Please upload a .docx or .pdf file.")
        
        # Extracting Contact Information
        contact = self.extract_contact_info(resume_text)

        # Extracting Skills
        skills = self.extract_skills(resume_text)

        # Extracting Experience
        experience = self.extract_experience(resume_text)

        # Extracting Education
        education = self.extract_education(resume_text)

        # Return extracted data as a dictionary
        return {
            'contact': contact,
            'skills': skills,
            'experience': experience,
            'education': education
        }

    def extract_text_from_docx(self):
        """Extracts text from a .docx file"""
        doc = Document(self.file_path)
        return '\n'.join([para.text for para in doc.paragraphs])

    def extract_text_from_pdf(self):
        """Extracts text from a .pdf file"""
        doc = fitz.open(self.file_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text()
        return text

    def extract_contact_info(self, text):
        """Extracts contact details such as name, email, and phone number from resume text."""
        name = re.search(r"([A-Z][a-z]*\s[A-Z][a-z]*)", text)
        email = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        phone = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)

        return {
            'name': name.group(1) if name else "Not found",
            'email': email.group(0) if email else "Not found",
            'phone': phone.group(0) if phone else "Not found"
        }

    def extract_skills(self, text):
        """Extracts skills from resume text (simplified by matching keywords)."""
        skills_keywords = ['Python', 'Machine Learning', 'SQL', 'Data Science', 'Java', 'C++','SAP',"SAP ABAP","SAP HANA"]
        skills = [skill for skill in skills_keywords if skill.lower() in text.lower()]
        return skills

    def extract_experience(self, text):
        """Extracts work experience from resume text."""
        experience_pattern = re.findall(r"([A-Za-z\s]+) at ([A-Za-z\s]+) \((\d{4}-\d{4})\)", text)
        experience = []
        for exp in experience_pattern:
            experience.append({"role": exp[0], "company": exp[1], "years": exp[2]})
        return experience

    def extract_education(self, text):
        """Extracts educational background from resume text."""
        education_pattern = re.findall(r"([A-Za-z\s]+) from ([A-Za-z\s]+) \((\d{4})\)", text)
        education = []
        for edu in education_pattern:
            education.append({"degree": edu[0], "institution": edu[1], "year": edu[2]})
        return education

    def interactive_resume_preview(self):
        """Creates an interactive preview of how the resume might appear to an ATS system."""
        extracted_data = self.extract_resume_data()
        
        # Simulating the interactive preview display
        preview = f"--- Interactive Resume Preview for ATS ---\n\n"
        
        # Display Contact Information
        preview += f"Contact Information:\nName: {extracted_data['contact']['name']}\n"
        preview += f"Email: {extracted_data['contact']['email']}\n"
        preview += f"Phone: {extracted_data['contact']['phone']}\n\n"
        
        # Display Skills
        preview += f"Skills:\n" + "\n".join(extracted_data['skills']) + "\n\n"
        
        # Display Experience
        # preview += f"Experience:\n"
        # for exp in extracted_data['experience']:
        #     # preview += f"{exp['role']} at {exp['company']} ({exp['years']})\n"
        
        # # Display Education
        # preview += f"\nEducation:\n"
        # for edu in extracted_data['education']:
        #     # preview += f"{edu['degree']} from {edu['institution']} ({edu['year']})\n"
        
        # preview += "\n----------------------------------------"
        
        # Return the preview for user display
        return preview

# Example Usage
ats_checker = ATSFormatChecker("Uploads/Akshay patel ABAP 1.pdf")  # Or path_to_resume.docx
preview = ats_checker.interactive_resume_preview()
print(preview)
