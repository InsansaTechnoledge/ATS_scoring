from flask import jsonify

class ApiResponse:
    @staticmethod
    def success(data, status_code=200):
        """Format successful API response"""
        return jsonify(data), status_code
    
    @staticmethod
    def error(message, status_code=400):
        """Format error API response"""
        return jsonify({"error": message}), status_code
    
    @staticmethod
    def home_response():
        """Format home endpoint response"""
        return jsonify({
            "status": "active",
            "service": "Resume ATS Analyzer",
            "endpoints": [
                {"path": "/analyze", "method": "POST", "description": "Analyze a resume against a job description"},
                {"path": "/history", "method": "GET", "description": "Get history of analyzed resumes"},
                {"path": "/report/<file_id>", "method": "GET", "description": "Get detailed report for a specific analysis"},
                {"path": "/stats", "method": "GET", "description": "Get aggregate statistics across all analyzed resumes"},
                {"path": "/compare", "method": "POST", "description": "Compare multiple resumes against a job description"}
            ]
        })