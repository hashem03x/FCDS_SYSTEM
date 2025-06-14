from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import CollegeSystemChatbot
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
chatbot = None

@app.route('/api/initialize', methods=['POST'])
def initialize():
    global chatbot
    student_id = request.json.get('student_id')
    if not student_id:
        return jsonify({'error': 'Student ID is required'}), 400
    
    try:
        chatbot = CollegeSystemChatbot()
        chatbot.student_id = student_id
        # Get student name from database
        student = chatbot.users.find_one({"id": student_id, "role": "student"})
        if student:
            chatbot.student_name = student.get('name', 'Student')
            return jsonify({
                'success': True,
                'message': f'Welcome {chatbot.student_name}!',
                'student_name': chatbot.student_name
            })
        else:
            return jsonify({'error': 'Student ID not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    global chatbot
    if not chatbot:
        return jsonify({'error': 'Please initialize the chatbot first'}), 400
    
    message = request.json.get('message')
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        response = chatbot.process_query(message)
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 