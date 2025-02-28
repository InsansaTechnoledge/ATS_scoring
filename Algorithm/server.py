from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from main import analyseResume

app = Flask(__name__)

# Enable CORS for all routes (allow all domains)
CORS(app, resources={r"/*": {"origins": "*"}})  # Only allow requests from localhost:5173

# GET route
@app.route('/', methods=['GET'])
def get_example():
    return jsonify({"message": "Flask server running successfully!"})

# POST route
@app.route('/analyse', methods=['POST'])
def post_example():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    job_description = request.form.get('job_description')

    file = request.files['file']
    if file:
        file_path = os.path.join('Uploads', file.filename)
        file.save(file_path)

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    response = analyseResume(file_path, job_description)

    os.remove(file_path)
    
    return jsonify({"message": "File analysed successfully!", "result":response}), 200
if __name__ == '__main__':
    app.run(debug=True)