# from flask import Blueprint, request, jsonify
# from werkzeug.utils import secure_filename
# from api.utils import save_uploaded_file, cleanup_file, validate_file
# from core.scanner import EnhancedATSScanner
# from config import Config
# import uuid
# import os

# # Create blueprint
# api_bp = Blueprint('api', __name__)

# # Initialize scanner
# scanner = EnhancedATSScanner()

# # api/routes.py (scan endpoint only - batch-scan follows same pattern)
# @api_bp.route('/api/scan', methods=['POST'])
# def scan_resume():
#     """Scan single resume"""
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file provided'}), 400
    
#     file = request.files['file']
#     job_description = request.form.get('job_description', '').strip()
    
#     # Validate file
#     validation_error = validate_file(file)
#     if validation_error:
#         return jsonify({'error': validation_error}), 400
    
#     file_path = None
#     try:
#         # Save file temporarily
#         file_path = save_uploaded_file(file)
        
#         # Extract text and parse resume data
#         text = scanner.document_parser.extract_text(file_path)
#         resume_data = scanner.resume_parser.parse_resume(text)
        
#         # Add readability analysis (only scores)
#         readability_scores = scanner.readability_analyzer.analyze(text)
        
#         # Scan resume
#         result = scanner.scan_resume(file_path, job_description or None)
        
#         # Clean up
#         cleanup_file(file_path)
        
#         return jsonify({
#             'success': True,
#             'result': {
#                 'overall_score': round(result.overall_score, 2),
#                 'scoring_type': result.scoring_type,
#                 'breakdown': {k: round(v, 2) for k, v in result.breakdown.items()},
#                 'feedback': result.feedback,
#                 'recommendations': result.recommendations
#             },
#             'parsed_data': {
#                 'skills': resume_data.get('skills', []),
#                 'experience_years': resume_data.get('experience', 0),
#                 'education': resume_data.get('education', []),
#                 'contact_info': resume_data.get('contact_info', {}),
#                 'sections': resume_data.get('sections', []),
#                 'word_count': resume_data.get('word_count', 0),
#                 'bullet_points': resume_data.get('bullet_points', 0),
#                 'readability': readability_scores  # Only the scores dictionary
#             }
#         })
        
#     except Exception as e:
#         if file_path:
#             cleanup_file(file_path)
#         return jsonify({'error': str(e)}), 500

# @api_bp.route('/api/batch-scan', methods=['POST'])
# def batch_scan():
#     """Scan multiple resumes"""
#     if 'files' not in request.files:
#         return jsonify({'error': 'No files provided'}), 400
    
#     files = request.files.getlist('files')
#     job_description = request.form.get('job_description', '').strip()
    
#     if not files or all(f.filename == '' for f in files):
#         return jsonify({'error': 'No files selected'}), 400
    
#     results = []
#     file_paths = []
    
#     try:
#         # Save all files temporarily
#         for file in files:
#             if not validate_file(file):
#                 file_path = save_uploaded_file(file)
#                 file_paths.append((file_path, file.filename))
        
#         # Scan all resumes
#         for file_path, original_name in file_paths:
#             try:
#                 text = scanner.document_parser.extract_text(file_path)
#                 resume_data = scanner.resume_parser.parse_resume(text)
#                 readability_scores = scanner.readability_analyzer.analyze(text)
                
#                 result = scanner.scan_resume(file_path, job_description or None)
                
#                 results.append({
#                     'filename': original_name,
#                     'success': True,
#                     'overall_score': round(result.overall_score, 2),
#                     'scoring_type': result.scoring_type,
#                     'breakdown': {k: round(v, 2) for k, v in result.breakdown.items()},
#                     'feedback': result.feedback,
#                     'recommendations': result.recommendations,
#                     'parsed_data': {
#                         'skills': resume_data.get('skills', []),
#                         'experience_years': resume_data.get('experience', 0),
#                         'education': resume_data.get('education', []),
#                         'contact_info': resume_data.get('contact_info', {}),
#                         'sections': resume_data.get('sections', []),
#                         'word_count': resume_data.get('word_count', 0),
#                         'bullet_points': resume_data.get('bullet_points', 0),
#                         'readability': readability_scores  # Only the scores dictionary
                        
#                     }
#                 })
#             except Exception as e:
#                 results.append({
#                     'filename': original_name,
#                     'success': False,
#                     'error': str(e)
#                 })
        
#         # Clean up files
#         for file_path, _ in file_paths:
#             cleanup_file(file_path)
        
#         # Sort by score (highest first)
#         successful_results = [r for r in results if r.get('success')]
#         successful_results.sort(key=lambda x: x.get('overall_score', 0), reverse=True)
        
#         failed_results = [r for r in results if not r.get('success')]
        
#         return jsonify({
#             'success': True,
#             'results': successful_results + failed_results,
#             'summary': {
#                 'total_processed': len(results),
#                 'successful': len(successful_results),
#                 'failed': len(failed_results)
#             }
#         })
        
#     except Exception as e:
#         # Clean up on error
#         for file_path, _ in file_paths:
#             cleanup_file(file_path)
#         return jsonify({'error': str(e)}), 500

# @api_bp.route('/', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return "Server is running successfully"

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from api.utils import save_uploaded_file, cleanup_file, validate_file
from core.scanner import EnhancedATSScanner
from config import Config
import uuid
import os

# Create blueprint
api_bp = Blueprint('api', __name__)

# Initialize scanner
scanner = EnhancedATSScanner()

@api_bp.route('/api/scan', methods=['POST'])
def scan_resume():
    """Scan single resume"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    job_description = request.form.get('job_description', '').strip()
    
    # Validate file
    validation_error = validate_file(file)
    if validation_error:
        return jsonify({'success': False, 'error': validation_error}), 400
    
    file_path = None
    try:
        # Save file temporarily
        file_path = save_uploaded_file(file)
        
        # Scan resume (includes validation now)
        result = scanner.scan_resume(file_path, job_description or None)
        
        # Handle validation errors
        if result.scoring_type == 'validation_error':
            cleanup_file(file_path)
            return jsonify({
                'success': False,
                'error': 'Document validation failed',
                'validation_error': True,
                'result': {
                    'overall_score': result.overall_score,
                    'scoring_type': result.scoring_type,
                    'breakdown': result.breakdown,
                    'feedback': result.feedback,
                    'recommendations': result.recommendations
                },
                'message': 'The uploaded document does not appear to be a resume or CV.'
            }), 400
        
        # Extract text and parse resume data for successful validation
        text = scanner.document_parser.extract_text(file_path)
        resume_data = scanner.resume_parser.parse_resume(text)
        
        # Add readability analysis (only scores)
        readability_scores = scanner.readability_analyzer.analyze(text)
        
        # Clean up
        cleanup_file(file_path)
        
        return jsonify({
            'success': True,
            'result': {
                'overall_score': round(result.overall_score, 2),
                'scoring_type': result.scoring_type,
                'breakdown': {k: round(v, 2) for k, v in result.breakdown.items()},
                'feedback': result.feedback,
                'recommendations': result.recommendations
            },
            'parsed_data': {
                'skills': resume_data.get('skills', []),
                'experience_years': resume_data.get('experience', 0),
                'education': resume_data.get('education', []),
                'contact_info': resume_data.get('contact_info', {}),
                'sections': resume_data.get('sections', []),
                'word_count': resume_data.get('word_count', 0),
                'bullet_points': resume_data.get('bullet_points', 0),
                'readability': readability_scores  # Only the scores dictionary
            }
        })
        
    except Exception as e:
        if file_path:
            cleanup_file(file_path)
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/api/batch-scan', methods=['POST'])
def batch_scan():
    """Scan multiple resumes"""
    if 'files' not in request.files:
        return jsonify({'success': False, 'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    job_description = request.form.get('job_description', '').strip()
    
    if not files or all(f.filename == '' for f in files):
        return jsonify({'success': False, 'error': 'No files selected'}), 400
    
    results = []
    file_paths = []
    
    try:
        # Save all files temporarily
        for file in files:
            if not validate_file(file):
                file_path = save_uploaded_file(file)
                file_paths.append((file_path, file.filename))
        
        # Scan all resumes
        for file_path, original_name in file_paths:
            try:
                # Scan resume (includes validation now)
                result = scanner.scan_resume(file_path, job_description or None)
                
                # Handle validation errors
                if result.scoring_type == 'validation_error':
                    results.append({
                        'filename': original_name,
                        'success': False,
                        'validation_error': True,
                        'error': 'Document validation failed - not a resume or CV',
                        'overall_score': result.overall_score,
                        'breakdown': result.breakdown,
                        'feedback': result.feedback,
                        'recommendations': result.recommendations
                    })
                    continue
                
                # Extract additional data for valid resumes
                text = scanner.document_parser.extract_text(file_path)
                resume_data = scanner.resume_parser.parse_resume(text)
                readability_scores = scanner.readability_analyzer.analyze(text)
                
                results.append({
                    'filename': original_name,
                    'success': True,
                    'overall_score': round(result.overall_score, 2),
                    'scoring_type': result.scoring_type,
                    'breakdown': {k: round(v, 2) for k, v in result.breakdown.items()},
                    'feedback': result.feedback,
                    'recommendations': result.recommendations,
                    'parsed_data': {
                        'skills': resume_data.get('skills', []),
                        'experience_years': resume_data.get('experience', 0),
                        'education': resume_data.get('education', []),
                        'contact_info': resume_data.get('contact_info', {}),
                        'sections': resume_data.get('sections', []),
                        'word_count': resume_data.get('word_count', 0),
                        'bullet_points': resume_data.get('bullet_points', 0),
                        'readability': readability_scores  # Only the scores dictionary
                    }
                })
                
            except Exception as e:
                results.append({
                    'filename': original_name,
                    'success': False,
                    'error': str(e)
                })
        
        # Clean up files
        for file_path, _ in file_paths:
            cleanup_file(file_path)
        
        # Sort by score (highest first) - only successful results
        successful_results = [r for r in results if r.get('success')]
        successful_results.sort(key=lambda x: x.get('overall_score', 0), reverse=True)
        
        # Failed results (including validation errors)
        failed_results = [r for r in results if not r.get('success')]
        
        # Separate validation errors for better reporting
        validation_failed = [r for r in failed_results if r.get('validation_error')]
        processing_failed = [r for r in failed_results if not r.get('validation_error')]
        
        return jsonify({
            'success': True,
            'results': successful_results + failed_results,
            'summary': {
                'total_processed': len(results),
                'successful': len(successful_results),
                'failed': len(failed_results),
                'validation_failed': len(validation_failed),
                'processing_failed': len(processing_failed)
            }
        })
        
    except Exception as e:
        # Clean up on error
        for file_path, _ in file_paths:
            cleanup_file(file_path)
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return "Server is running successfully"