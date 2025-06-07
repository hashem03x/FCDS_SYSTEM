from pymongo import MongoClient
from datetime import datetime
import pandas as pd
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class CollegeSystemChatbot:
    def __init__(self):
        # Connect to MongoDB
        self.client = MongoClient("mongodb+srv://marwaagamy:77d1hkPmMEnFUSrJ@cluster0.fed1s.mongodb.net/college-system?retryWrites=true&w=majority")
        self.db = self.client['college-system']
        
        # Initialize all collections
        self.announcements = self.db['announcements']
        self.complaints = self.db['complaints']
        self.courses = self.db['courses']
        self.exams = self.db['exams']
        self.grades = self.db['grades']
        self.users = self.db['users']
        
        # Cache for user names
        self.user_name_cache = {}
        
        # Student ID and name
        self.student_id = None
        self.student_name = None

    def initialize_student(self, student_id):
        """Initialize student session with given ID"""
        self.student_id = student_id
        student = self.users.find_one({"id": self.student_id, "role": "student"})
        if student:
            self.student_name = student.get('name', 'Student')
            return True, f"Hello {self.student_name}, ID: {self.student_id}"
        return False, "Student ID not found in the database"
    
    def get_student_id(self):
        """Prompt the user to enter their student ID at startup"""
        while not self.student_id:
            user_input = input("Please enter your student ID to start the conversation: ").strip()
            if user_input:
                self.student_id = user_input
                # Get student name from database
                student = self.users.find_one({"id": self.student_id, "role": "student"})
                if student:
                    self.student_name = student.get('name', 'Student')
                    print(f"\nHello {self.student_name}, ID: {self.student_id}\n")
                else:
                    print("\nStudent ID not found in the database. Please try again.\n")
                    self.student_id = None  # Reset to prompt again
    
    def show_welcome(self):
        welcome_msg = f"""
        🏫 College System Chatbot  
        👤 Student: {self.student_name} (ID: {self.student_id})  
        
        How can I help you today?  
        
        You can ask about:  
        - 📢 Announcements  
        - 📝 Complaints  
        - 📚 Courses (search by name/code)  
        - 📝 Exams  
        - 📊 Grades  
        - 👨‍🏫 Who teaches a course  
        - 🗓️ My class schedule
        - 📅 when are my classes
        - 📖 What courses am I taking
        
        Examples:  
        - show my courses
        - what upcoming exams
        - who teaches Calculus  
        - get me my grades  
        - info for programming 1
        - when is my linear algebra class
        - what's my schedule this semester
        - which courses am I enrolled in
        - info for Stochastic Processes
        - courses (shows all available courses)
        
        Type 'exit' to quit
        """
        print(welcome_msg)
    
    # Database query methods
    def get_doctor_name(self, doctor_id):
        if doctor_id in self.user_name_cache:
            return self.user_name_cache[doctor_id]
        
        doctor = self.users.find_one({"id": doctor_id, "role": "doctor"})
        if doctor:
            name = doctor.get('name', f"Doctor {doctor_id}")
            self.user_name_cache[doctor_id] = name
            return name
        return f"Doctor {doctor_id}"
    
    def get_announcements(self, course_code=None, limit=5):
        query = {"isDeleted": {"$ne": True}}
        if course_code:
            query["courseCode"] = course_code
        return list(self.announcements.find(query).sort("createdAt", -1).limit(limit))
    
    def get_complaints(self, status=None, user_id=None, limit=5):
        query = {}
        if status:
            query["status"] = status
        if user_id:
            query["userId"] = user_id
        return list(self.complaints.find(query).sort("createdAt", -1).limit(limit))
    
    def get_courses(self, department=None, doctor_id=None, active=True, student_id=None):
        query = {"isActive": True} if active else {}
        if department:
            query["department"] = department
        if doctor_id:
            query["doctorId"] = doctor_id
        if student_id:
            query["registeredStudents"] = {"$in": [student_id]}
        return list(self.courses.find(query))
    
    def get_courses_by_name(self, name_query, student_id=None):
        # Remove common prefixes/suffixes and normalize the query
        normalized_query = re.sub(r'(course|info|for|about|details)', '', name_query, flags=re.IGNORECASE).strip()
        
        # Handle common course name variations
        course_mappings = {
            'programming 1': 'Programming I',
            'programming i': 'Programming I',
            'programming one': 'Programming I',
            'programming 2': 'Programming II',
            'programming ii': 'Programming II',
            'programming two': 'Programming II',
            'prob stat': 'Probability and Statistics',
            'prob and stat': 'Probability and Statistics',
            'data struct': 'Data Structures',
            'calc': 'Calculus',
            'stochastic': 'Stochastic Processes',
            'stochastic processes': 'Stochastic Processes'
        }
        
        # Check if this is a known course variation
        normalized_query = course_mappings.get(normalized_query.lower(), normalized_query)
        
        # Create case-insensitive regex pattern that matches words regardless of order
        words = re.split(r'\s+', normalized_query)
        regex_pattern = '.*'.join([re.escape(word) for word in words])  # Match words in any order
        regex = re.compile(regex_pattern, re.IGNORECASE)
        
        query = {
            "$or": [
                {"name": {"$regex": regex}},
                {"code": {"$regex": regex}}
            ],
            "isActive": True
        }
        
        if student_id:
            query["registeredStudents"] = {"$in": [student_id]}
        
        return list(self.courses.find(query))
    
    def get_student_courses_from_registered(self, student_id):
        """Get courses from the user's registeredCourses array"""
        student = self.users.find_one({"id": student_id, "role": "student"})
        if not student:
            return []
    
        # Get the list of course codes from registeredCourses
        registered_course_codes = student.get('registeredCourses', [])
    
        # If you need full course details, you can fetch them from courses collection
        if registered_course_codes:
            return list(self.courses.find({
                "code": {"$in": registered_course_codes},
                "isActive": True
            }))
        return []
    
    def get_course_details(self, course_code):
        course = self.courses.find_one({"code": course_code})
        if course:
            doctor_name = self.get_doctor_name(course['doctorId'])
            course['doctorName'] = doctor_name
        return course
    
    def get_grades(self, student_id=None, course_code=None):
        query = {}
        if student_id:
            query["studentId"] = student_id
        if course_code:
            query["courseCode"] = course_code
        return list(self.grades.find(query).sort("dateGraded", -1))
    
    def get_user_info(self, user_id=None, role=None):
        query = {}
        if user_id:
            query["id"] = user_id
        if role:
            query["role"] = role
        return list(self.users.find(query))
    
    def get_student_schedule(self, student_id):
        """Get all lecture and section sessions for a student"""
        # Get all courses the student is registered in
        courses = self.get_student_courses_from_registered(student_id)
        if not courses:
            return None
        
        schedule = []
        
        for course in courses:
            course_code = course['code']
            course_name = course['name']
            
            # Check lecture sessions
            for lecture in course.get('lectureSessions', []):
                schedule.append({
                    'Type': 'Lecture',
                    'Course': f"{course_name} ({course_code})",
                    'Day': lecture['day'],
                    'Time': f"{lecture['startTime']} - {lecture['endTime']}",
                    'Room': lecture['room'],
                    'Instructor': self.get_doctor_name(course['doctorId'])
                })
            
            # Check section sessions
            for section in course.get('sections', []):
                if student_id in section.get('registeredStudents', []):
                    for session in section.get('sessions', []):
                        ta_name = self.get_doctor_name(section['taId']) if 'taId' in section else "TA Not Assigned"
                        schedule.append({
                            'Type': 'Section',
                            'Course': f"{course_name} ({course_code})",
                            'Day': session['day'],
                            'Time': f"{session['startTime']} - {session['endTime']}",
                            'Room': session['room'],
                            'Instructor': ta_name,
                            'Section': section.get('sectionId', '')
                        })
        
        return schedule
    
    def get_exams(self, course_code=None, upcoming=False, limit=5):
        """Get exams from database, optionally filtered by course or upcoming status"""
        query = {}
    
        if course_code:
            query["courseCode"] = course_code
    
        if upcoming:
            today = datetime.now().strftime("%Y-%m-%d")
            query["examDate"] = {"$gte": today}
    
        return list(self.exams.find(query).sort("examDate", 1).limit(limit))
    
    # Response display methods
    def show_announcements(self, announcements):
        if not announcements:
            return {"type": "text", "content": "No announcements found."}
        
        announcements_list = []
        for ann in announcements:
            announcements_list.append({
                'content': ann['content'],
                'course': ann.get('courseCode', 'N/A'),
                'from': ann['senderDetails'].get('name', ann['sender']),
                'date': ann['createdAt'].strftime('%Y-%m-%d') if isinstance(ann['createdAt'], datetime) else ann['createdAt']
            })
        
        return {
            "type": "announcement",
            "title": "Announcements",
            "headers": [ "Content", "Course", "From", "Date"],
            "data": announcements_list
        }
    
    def show_complaints(self, complaints):
        if not complaints:
            return {"type": "text", "content": "No complaints found."}
        
        complaints_list = []
        for comp in complaints:
            complaints_list.append({
                'userId': comp['userId'],
                'role': comp['role'],
                'complaint': comp['complaint'],
                'status': comp['status'],
                'date': comp['createdAt'].strftime('%Y-%m-%d') if isinstance(comp['createdAt'], datetime) else comp['createdAt']
            })
        
        return {
            "type": "table",
            "title": "Complaints",
            "headers": ["User ID", "Role", "Complaint", "Status", "Date"],
            "data": complaints_list
        }
    
    def show_courses(self, courses, title="Courses"):
        if not courses:
            return {
                "type": "text",
                "content": "No courses found matching your criteria."
            }
        
        courses_list = []
        for course in courses:
            doctor_name = self.get_doctor_name(course['doctorId'])
            courses_list.append({
                'code': course['code'],
                'name': course['name'],
                'doctor': doctor_name,
                'department': course['department'],
                'creditHours': course.get('creditHours', 'N/A'),
                'semester': course.get('semester', 'N/A')
            })
        
        return {
            "type": "table",
            "title": title,
            "headers": ["Code", "Name", "Doctor", "Department", "Credit hours", "Semester"],
            "data": courses_list
        }
    
    def show_exams(self, exams, title="Exams"):
        if not exams:
            return {
                "type": "text",
                "content": "No exams found matching your criteria."
            }
        
        exam_data = []
        for exam in exams:
            rooms = ", ".join(exam.get('roomNumbers', [])) if exam.get('roomNumbers') else "Not assigned"
            
            exam_data.append({
                'course': f"{exam['courseName']} ({exam['courseCode']})",
                'type': exam['examType'],
                'date': exam['examDate'],
                'time': f"{exam['startTime']} - {exam['endTime']}",
                'rooms': rooms,
                'semester': exam.get('semester', 'N/A'),
                'department': exam.get('department', 'N/A')
            })
        
        return {
            "type": "table",
            "title": title,
            "headers": ["Course", "Type", "Date", "Time", "Rooms", "Semester", "Department"],
            "data": exam_data
        }
    
    def show_grades(self, grades):
        if not grades:
            return {
                "type": "text",
                "content": f"No grades found for {self.student_name}. Please contact your instructor for more information."
            }
        
        grades_list = []
        for grade in grades:
            grades_list.append({
                'course': grade['courseName'],
                'code': grade['courseCode'],
                'score': grade['score'],
                'grade': grade['grade'],
                'term': grade['term'],
                'date': grade['dateGraded'].strftime('%Y-%m-%d') if isinstance(grade['dateGraded'], datetime) else grade['dateGraded']
            })
        
        return {
            "type": "table",
            "title": "Grades",
            "headers": ["Course", "Code", "Score", "Grade", "Term", "Date"],
            "data": grades_list
        }
    
    def show_doctor_info(self, doctor, course=None):
        courses_taught = list(self.courses.find({"doctorId": doctor['id']}))
        courses_list = []
        for c in courses_taught:
            if course and c['code'] == course['code']:
                continue
            courses_list.append({
                'code': c['code'],
                'name': c['name']
            })
        
        return {
            "type": "doctor_info",
            "title": course['name'] if course else 'Doctor Information',
            "data": {
                "name": doctor['name'],
                "email": doctor.get('email', 'N/A'),
                "courses": courses_list
            }
        }
    
    def show_course_detail(self, course):
        if not course:
            return {"type": "text", "content": "Course not found."}
        
        doctor = self.users.find_one({"id": course['doctorId'], "role": "doctor"})
        if not doctor:
            return {"type": "text", "content": f"Course found but could not find instructor with ID {course['doctorId']}"}
        
        lecture_sessions = []
        for session in course.get('lectureSessions', []):
            lecture_sessions.append({
                'day': session['day'],
                'time': f"{session['startTime']}-{session['endTime']}",
                'room': session['room']
            })
        
        sections = []
        for section in course.get('sections', []):
            ta_name = self.get_doctor_name(section['taId']) if 'taId' in section else "TA Not Assigned"
            section_sessions = []
            for session in section.get('sessions', []):
                section_sessions.append({
                    'day': session['day'],
                    'time': f"{session['startTime']}-{session['endTime']}",
                    'room': session['room']
                })
            sections.append({
                'sectionId': section.get('sectionId', 'Unnamed Section'),
                'ta': ta_name,
                'sessions': section_sessions
            })
        
        return {
            "type": "course_detail",
            "data": {
                "code": course['code'],
                "name": course['name'],
                "instructor": doctor['name'],
                "department": course['department'],
                "creditHours": course['creditHours'],
                "semester": course['semester'],
                "lectureSessions": lecture_sessions,
                "sections": sections
            }
        }
    
    def show_schedule(self, schedule):
        if not schedule:
            return {
                "type": "text",
                "content": "No schedule found. You don't appear to be registered in any courses this semester. Please contact your academic advisor if this is incorrect."
            }
        
        return {
            "type": "table",
            "title": "Your Class Schedule",
            "headers": ["Type", "Course", "Day", "Time", "Room", "Instructor", "Section"],
            "data": schedule
        }
    
    def chat(self):
        while True:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ['exit', 'quit']:
                print(f"\nGoodbye {self.student_name}!")
                break
                
            response = self.process_query(user_input)
            print(f"\nBot:\n{response}")
    
    def process_query(self, query):
        """Process user query and return response"""
        query = query.lower().strip()
        
        # Handle different types of queries
        if any(word in query for word in ['announcement', 'news', 'update']):
            announcements = self.get_announcements()
            return self.show_announcements(announcements)
            
        elif any(word in query for word in ['complaint', 'issue', 'problem']):
            complaints = self.get_complaints(user_id=self.student_id)
            return self.show_complaints(complaints)
            
        elif any(word in query for word in ['course', 'subject', 'class']):
            if 'teach' in query or 'instructor' in query or 'professor' in query:
                courses = self.get_courses_by_name(query)
                if courses:
                    return self.show_doctor_info(courses[0])
            else:
                courses = self.get_student_courses_from_registered(self.student_id)
                return self.show_courses(courses, "Your Courses")
                
        elif any(word in query for word in ['exam', 'test', 'quiz']):
            exams = self.get_exams(upcoming=True)
            return self.show_exams(exams, "Upcoming Exams")
            
        elif any(word in query for word in ['grade', 'mark', 'score']):
            grades = self.get_grades(student_id=self.student_id)
            return self.show_grades(grades)
            
        elif any(word in query for word in ['schedule', 'timetable', 'when is my class']):
            schedule = self.get_student_schedule(self.student_id)
            return self.show_schedule(schedule)
            
        else:
            return "I'm not sure how to help with that. Please try asking about announcements, courses, exams, grades, or your schedule."

# Create a single instance of the chatbot
chatbot = CollegeSystemChatbot()

@app.route('/initialize', methods=['POST'])
def initialize():
    data = request.get_json()
    student_id = data.get('student_id')
    if not student_id:
        return jsonify({'success': False, 'message': 'Student ID is required'})
    
    success, message = chatbot.initialize_student(student_id)
    return jsonify({'success': success, 'message': message})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    query = data.get('query')
    if not query:
        return jsonify({'success': False, 'message': 'Query is required'})
    
    if not chatbot.student_id:
        return jsonify({'success': False, 'message': 'Please initialize the chatbot with a student ID first'})
    
    response = chatbot.process_query(query)
    return jsonify({'success': True, 'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)