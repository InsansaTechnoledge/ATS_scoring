from flask import request, send_file
import tempfile
import datetime
import logging
import os
import statistics
from collections import Counter
from api.response import ApiResponse
from services.analyzer import ResumeAnalyzer
from services.report_service import ReportService
from services.file_service import load_results

logger = logging.getLogger(__name__)

# Initialize the services
analyzer = ResumeAnalyzer()
report_service = ReportService()

def register_routes(app):
    @app.route('/', methods=['GET'])
    def home():
        return ApiResponse.home_response()

    @app.route('/analyze', methods=['POST'])
    def analyze():
        try:
            if 'file' not in request.files:
                return ApiResponse.error("No file uploaded")
            
            file = request.files['file']
            
            # Removed PDF-only check to support all file types
            
            analyzer.job_description = request.form.get("job_description", "")
            
            logger.info(f"Analyzing file: {file.filename}")
            
            # Update text extraction to handle different file types
            text = analyzer.extract_text_from_file(file) or ""
            if not text or len(text) < 50:
                return ApiResponse.error("Failed to extract text from file or text too short")
            
            result = analyzer.analyze_resume(text, file.filename)
            if result is None:
                return ApiResponse.error("Resume analysis failed")

            return ApiResponse.success(result)
        except Exception as e:
            logger.error(f"Error in analyze endpoint: {str(e)}")
            return ApiResponse.error(str(e), 500)

    @app.route('/history', methods=['GET'])
    def get_history():
        """Get history of analyzed resumes"""
        try:
            results = load_results()
            
            # Optionally filter by date range
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            if start_date or end_date:
                filtered_results = {}
                for file_id, data in results.items():
                    file_date = datetime.datetime.fromisoformat(data['last_checked'])
                    
                    if start_date:
                        start = datetime.datetime.fromisoformat(start_date)
                        if file_date < start:
                            continue
                            
                    if end_date:
                        end = datetime.datetime.fromisoformat(end_date)
                        if file_date > end:
                            continue
                            
                    filtered_results[file_id] = data
                
                return ApiResponse.success(filtered_results)
            
            return ApiResponse.success(results)
        except Exception as e:
            logger.error(f"Error in history endpoint: {str(e)}")
            return ApiResponse.error(str(e), 500)

    @app.route('/report/<file_id>', methods=['GET'])
    def get_report(file_id):
        """Get a detailed report for a specific analysis"""
        try:
            results = load_results()
            
            if file_id not in results:
                return ApiResponse.error(f"No analysis found for ID: {file_id}", 404)
                
            result = results[file_id]
            
            format_type = request.args.get('format', 'json')
            
            if format_type == 'text':
                report_text = report_service.generate_report(result)
                
                # Create a temporary text file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w') as tmp_file:
                    tmp_file.write(report_text)
                    tmp_file_path = tmp_file.name
                    
                return send_file(
                    tmp_file_path,
                    as_attachment=True,
                    download_name=f"resume_report_{file_id}.txt",
                    mimetype="text/plain"
                )
            
            return ApiResponse.success(result)
        except Exception as e:
            logger.error(f"Error in report endpoint: {str(e)}")
            return ApiResponse.error(str(e), 500)

    @app.route('/stats', methods=['GET'])
    def get_stats():
        """Get aggregate statistics across all analyzed resumes"""
        try:
            results = load_results()
            
            if not results:
                return ApiResponse.error("No data available", 404)
                
            scores = []
            word_counts = []
            industry_counts = {}
            common_issues = Counter()
            
            for file_id, data in results.items():
                if 'result' in data:
                    result = data['result']
                    scores.append(result.get('score', 0))
                    word_counts.append(result.get('word_count', 0))
                    
                    industry = result.get('industry')
                    if industry:
                        industry_counts[industry] = industry_counts.get(industry, 0) + 1
                    
                    # Count common issues
                    for rec in result.get('recommendations', []):
                        common_issues[rec] += 1
            
            stats = {
                "total_resumes": len(results),
                "score_metrics": {
                    "average": statistics.mean(scores) if scores else 0,
                    "median": statistics.median(scores) if scores else 0,
                    "min": min(scores) if scores else 0,
                    "max": max(scores) if scores else 0
                },
                "word_count_metrics": {
                    "average": int(statistics.mean(word_counts)) if word_counts else 0,
                    "median": int(statistics.median(word_counts)) if word_counts else 0,
                    "min": min(word_counts) if word_counts else 0,
                    "max": max(word_counts) if word_counts else 0
                },
                "industry_distribution": industry_counts,
                "common_issues": {issue: count for issue, count in common_issues.most_common(5)}
            }
            
            return ApiResponse.success(stats)
        except Exception as e:
            logger.error(f"Error in stats endpoint: {str(e)}")
            return ApiResponse.error(str(e), 500)

    @app.route('/compare', methods=['POST'])
    def compare_resumes():
        """Compare multiple resumes against a job description"""
        try:
            if 'files' not in request.files:
                return ApiResponse.error("No files uploaded", 400)
            
            files = request.files.getlist('files')
            if len(files) < 2:
                return ApiResponse.error("At least two files are required for comparison", 400)
            
            job_description = request.form.get("job_description", "")
            analyzer.job_description = job_description
            
            results = []
            for file in files:
                # Removed PDF-only check to support all file types
                    
                text = analyzer.extract_text_from_file(file)
                if not text or len(text) < 50:
                    continue
                    
                result = analyzer.analyze_resume(text, file.filename)
                results.append(result)
            
            # Sort results by score
            results.sort(key=lambda x: x['result']['score'], reverse=True)
            
            response_data = {
                "comparison": results,
                "best_match": results[0] if results else None,
                "job_description": job_description
            }
            
            return ApiResponse.success(response_data)
        except Exception as e:
            logger.error(f"Error in compare endpoint: {str(e)}")
            return ApiResponse.error(str(e), 500)