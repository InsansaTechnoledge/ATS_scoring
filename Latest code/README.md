# Resume Algorithm - ATS Scanner

An intelligent resume scanning system that provides both job-specific matching and general quality assessment.

## Features

- **Dual Scoring System**: Job matching and quality assessment
- **Multi-format Support**: PDF and DOCX files
- **Comprehensive Analysis**: Skills, experience, education, and content quality
- **RESTful API**: Easy integration with web applications
- **Batch Processing**: Scan multiple resumes simultaneously

## Installation

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Download spaCy model: `python -m spacy download en_core_web_sm`
4. Run the application: `python app.py`

## API Endpoints

- `POST /api/scan` - Scan single resume
- `POST /api/batch-scan` - Scan multiple resumes
- `GET /api/health` - Health check

## Project Structure

```
Resume_Algorithm/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── core/                 # Core business logic
├── models/               # Data models
├── data/                 # Skills database
├── api/                  # API routes and utilities
└── utils/                # Utility functions
```