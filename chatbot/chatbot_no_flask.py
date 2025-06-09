from pymongo import MongoClient
from datetime import datetime
import pandas as pd
import re

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
        
        # Start conversation
        self.get_student_id()
        self.show_welcome()
    
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
            return "No announcements found."
        
        announcements_list = []
        for ann in announcements:
            announcements_list.append({
                'Title': ann['title'],
                'Content': ann['content'],
                'Course': ann.get('courseCode', 'N/A'),
                'From': ann['senderDetails'].get('name', ann['sender']),
                'Date': ann['createdAt'].strftime('%Y-%m-%d') if isinstance(ann['createdAt'], datetime) else ann['createdAt']
            })
        
        df = pd.DataFrame(announcements_list)
        return df.to_string(index=False)
    
    def show_complaints(self, complaints):
        if not complaints:
            return "No complaints found."
        
        complaints_list = []
        for comp in complaints:
            complaints_list.append({
                'User ID': comp['userId'],
                'Role': comp['role'],
                'Complaint': comp['complaint'],
                'Status': comp['status'],
                'Date': comp['createdAt'].strftime('%Y-%m-%d') if isinstance(comp['createdAt'], datetime) else comp['createdAt']
            })
        
        df = pd.DataFrame(complaints_list)
        return df.to_string(index=False)
    
    def show_courses(self, courses, title="Courses"):
        if not courses:
            return f"""
            No courses found
            There are currently no courses matching your criteria.
            """
        
        courses_list = []
        for course in courses:
            doctor_name = self.get_doctor_name(course['doctorId'])
            courses_list.append({
                'Code': course['code'],
                'Name': course['name'],
                'Doctor': doctor_name,
                'Department': course['department'],
                'Credit Hours': course.get('creditHours', 'N/A'),
                'Semester': course.get('semester', 'N/A')
            })
        
        df = pd.DataFrame(courses_list)
        return f"{title}\n{df.to_string(index=False)}"
    
    def show_exams(self, exams, title="Exams"):
        if not exams:
            return f"""
            No Exams Found
            There are currently no exams matching your criteria.
            """
        
        exam_data = []
        for exam in exams:
            # Handle room display - show all rooms if available
            rooms = ", ".join(exam.get('roomNumbers', [])) if exam.get('roomNumbers') else "Not assigned"
            
            exam_data.append({
                'Course': f"{exam['courseName']} ({exam['courseCode']})",
                'Type': exam['examType'],
                'Date': exam['examDate'],
                'Time': f"{exam['startTime']} - {exam['endTime']}",
                'Rooms': rooms,
                'Semester': exam.get('semester', 'N/A'),
                'Department': exam.get('department', 'N/A')
            })
        
        df = pd.DataFrame(exam_data)
        return f"{title}\n{df.to_string(index=False)}"
    
    def show_grades(self, grades):
        if not grades:
            return f"""
            No grades found for {self.student_name}
            Possible reasons:
            - No courses graded yet
            - You are not registered in any courses
            
            Please contact your instructor for more information.
            """
        
        grades_list = []
        for grade in grades:
            grades_list.append({
                'Course': grade['courseName'],
                'Code': grade['courseCode'],
                'Score': grade['score'],
                'Grade': grade['grade'],
                'Term': grade['term'],
                'Date': grade['dateGraded'].strftime('%Y-%m-%d') if isinstance(grade['dateGraded'], datetime) else grade['dateGraded']
            })
        
        df = pd.DataFrame(grades_list)
        return df.to_string(index=False)
    
    def show_doctor_info(self, doctor, course=None):
        response = f"""
        {course['name'] if course else 'Doctor Information'}
        Name: {doctor['name']}
        Email: {doctor.get('email', 'N/A')}
        """
        
        # Get all courses taught by this doctor
        courses_taught = list(self.courses.find({"doctorId": doctor['id']}))
        if courses_taught:
            response += "\nCourses Teaching:\n"
            for c in courses_taught:
                if course and c['code'] == course['code']:
                    continue  # Skip if it's the current course
                response += f"- {c['code']}: {c['name']}\n"
        
        return response
    
    def show_course_detail(self, course):
        if not course:
            return "Course not found."
        
        doctor = self.users.find_one({"id": course['doctorId'], "role": "doctor"})
        if not doctor:
            return f"Course found but could not find instructor with ID {course['doctorId']}"
        
        details = f"""
        {course['code']}: {course['name']}
        Instructor: {doctor['name']}
        Department: {course['department']}
        Credit Hours: {course['creditHours']}
        Semester: {course['semester']}
        """
        
        # Add lecture sessions
        if course.get('lectureSessions'):
            details += "\nLecture Sessions:\n"
            for session in course['lectureSessions']:
                details += f"- {session['day']}: {session['startTime']}-{session['endTime']} (Room: {session['room']})\n"
        
        # Add sections
        if course.get('sections'):
            details += "\nSections:\n"
            for section in course['sections']:
                ta_name = self.get_doctor_name(section['taId']) if 'taId' in section else "TA Not Assigned"
                details += f"\n{section.get('sectionId', 'Unnamed Section')} (TA: {ta_name})\n"
                for session in section.get('sessions', []):
                    details += f"- {session['day']}: {session['startTime']}-{session['endTime']} (Room: {session['room']})\n"
        
        return details
    
    def show_schedule(self, schedule):
        if not schedule:
            return """
            No Schedule Found
            You don't appear to be registered in any courses this semester.
            Please contact your academic advisor if this is incorrect.
            """
        
        # Convert to DataFrame for nice display
        df = pd.DataFrame(schedule)
        
        # Group by day for better organization
        days_order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        df['Day'] = pd.Categorical(df['Day'], categories=days_order, ordered=True)
        df = df.sort_values('Day')
        
        return f"Your Class Schedule\n{df.to_string(index=False)}"
    
    def chat(self):
        while True:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ['exit', 'quit']:
                print(f"\nGoodbye {self.student_name}!")
                break
                
            response = self.process_query(user_input)
            print(f"\nBot:\n{response}")
    
    def process_query(self, query):
        query_lower = query.lower()
        
        # Announcements
        if any(word in query_lower for word in ['announce', 'news']):
            if 'course' in query_lower:
                parts = query.split()
                course_code = next((p for p in parts if '-' in p and p.replace('-','').isdigit()), None)
                if course_code:
                    return self.show_announcements(self.get_announcements(course_code))
                return "Please specify a course code (e.g., 'announcements for 02-24-00101')"
            return self.show_announcements(self.get_announcements())
        
        # Complaints
        elif any(word in query_lower for word in ['complaint', 'issue']):
            status = "Pending" if 'pending' in query_lower else ("Resolved" if 'resolved' in query_lower else None)
            return self.show_complaints(self.get_complaints(status, self.student_id))
            
        # Courses - shows only registered courses when asking "my courses"
        elif any(phrase in query_lower for phrase in [
            'my courses', 
            'registered courses',
            'what courses am i taking',
            'which courses am i enrolled in',
            'what classes am i taking',
            'show my enrolled courses',
            'list my courses',
            'display my classes'
        ]):
            courses = self.get_student_courses_from_registered(self.student_id)
            return self.show_courses(courses, title=f"My Registered Courses")
            
        # Schedule queries
        elif any(phrase in query_lower for phrase in [
            'my schedule',
            'class schedule',
            'lecture schedule',
            'when are my classes',
            'what is my timetable',
            'show my timetable',
            'when do i have lectures',
            'what are my class times',
            'When are my lectures'
        ]):
            schedule = self.get_student_schedule(self.student_id)
            return self.show_schedule(schedule)
            
        # Specific course schedule queries
        elif any(phrase in query_lower for phrase in [
            'when is my',
            'what time is my',
            'schedule for',
            'timetable for',
            'lectures for',
            'class times for'
        ]) and any(word in query_lower for word in ['course', 'class', 'lecture']):
            # Extract course name
            course_name = re.sub(
                r'(when is|what time is|schedule for|timetable for|lectures for|class times for|my|course|class|lecture)\s*', 
                '', 
                query_lower
            ).strip()
            
            if not course_name:
                return "Please specify which course you're asking about "
            
            # Get all courses matching the name
            courses = self.get_courses_by_name(course_name, self.student_id)
            
            if not courses:
                return f"No courses found matching '{course_name}' that you're enrolled in"
            
            if len(courses) > 1:
                return f"""
                Multiple matches found for '{course_name}':
                {self.show_courses(courses)}
                Please be more specific about which course you want schedule information for.
                """
            
            return self.show_course_detail(courses[0])
            
        # General course information requests
        elif any(phrase in query_lower for phrase in [
            'tell me about courses', 
            'what courses are available',
            'list courses',
            'show courses',
            'course information',
            'available courses',
            'get all courses',
            'all courses',
            'courses'  # Added this to respond to just "courses"
        ]):
            courses = self.get_courses()
            if not courses:
                return "No available courses found."
            return self.show_courses(courses, title="Available Courses")
            
        # Courses by name
        elif any(phrase in query_lower for phrase in ['find course', 'search course', 'show course', 'course named']):
            name_query = re.sub(r'(find|search|show|course named?)\s*', '', query, flags=re.IGNORECASE).strip()
            if not name_query:
                return "Please specify a course name to search for."
            courses = self.get_courses_by_name(name_query)
            return self.show_courses(courses, title=f"Courses Matching '{name_query}'")
        
        # Course details by name
        elif any(phrase in query_lower for phrase in ['more info','info', 'detail', 'about','info for', 'details for', 'about course']):
            name_query = re.sub(r'(info for|details for|about course|more info|info|detail)\s*', '', query, flags=re.IGNORECASE).strip()

            if not name_query:
                return "Please specify a course name."

            # Handle common course name variations
            course_mappings = {
                'programming 1': 'Programming I',
                'programming i': 'Programming I',
                'programming 2': 'Programming II',
                'probability and statistics 1': 'Probability and Statistics I',
                'probability and statistics 2': 'Probability and Statistics II',
                'data structure': 'Data Structures',
                'calculus': 'Calculus',
                'stochastic': 'Stochastic Processes',
                'stochastic processes': 'Stochastic Processes'
            }

            name_query = course_mappings.get(name_query.lower(), name_query)

            # Initial search (possibly partial matches)
            courses = self.get_courses_by_name(name_query)

            if not courses:
                return f"No courses found matching '{name_query}'"

            # Try to filter exact match from results
            exact_matches = [c for c in courses if c['name'].lower() == name_query.lower()]
            if exact_matches:
                courses = exact_matches

            if len(courses) > 1:
                return f"""
                Multiple courses found matching '{name_query}':
                {self.show_courses(courses)}
                Please specify which one you want details for.
                """

            return self.show_course_detail(self.get_course_details(courses[0]['code']))
        
        # Exams - shows all exams by default
        elif any(word in query_lower for word in ['exam', 'test']):
            # Show exams for specific course
            if 'for' in query_lower:
                course_code = next((p for p in query.split() if '-' in p and p.replace('-','').isdigit()), None)
                if course_code:
                    exams = self.get_exams(course_code=course_code, upcoming=False)
                    return self.show_exams(exams, title=f"Exams for Course {course_code}")
                return "Please specify a course code (e.g., 'exams for 02-24-00101')"
            
            # Show only upcoming exams
            elif 'upcoming' in query_lower:
                exams = self.get_exams(upcoming=True)
                return self.show_exams(exams, title="Upcoming Exams")
            
            # Show only past exams
            elif 'past' in query_lower:
                today = datetime.now().strftime("%Y-%m-%d")
                exams = list(self.exams.find({"examDate": {"$lt": today}}).sort("examDate", -1))
                return self.show_exams(exams, title="Past Exams")
            
            # Default case - show all exams
            else:
                exams = self.get_exams(upcoming=False)
                return self.show_exams(exams, title="All Exams")
        
        # Grades
        elif any(word in query_lower for word in ['grade', 'score', 'result']):
                # Use the logged-in student ID
                return self.show_grades(self.get_grades(self.student_id))

        # Enhanced Doctor/Course queries
        elif any(word in query_lower for word in ['doctor', 'professor', 'instructor', 'teach', 'teacher', 'who']):
            # Standardize "Programming 1" variations
            if 'programming 1' in query_lower or 'programming i' in query_lower:
                course_name = 'Programming I'
            else:
                # Extract course name from various query patterns
                patterns = [
                    r'who (?:teaches|teaching|is teaching) (.+)',
                    r'who is the (?:doctor|professor|instructor|teacher) (?:for|of) (.+)',
                    r'(?:doctor|professor|instructor|teacher) (?:for|of) (.+)',
                    r'(.+) (?:doctor|professor|instructor|teacher)',
                    r'(.+) teaches',
                    r'teaches (.+)'
                ]
                
                course_name = None
                for pattern in patterns:
                    match = re.search(pattern, query_lower)
                    if match:
                        course_name = match.group(1).strip('?').strip()
                        break
            
            if course_name:
                # Handle common course name variations
                course_mappings = {
                    'programming 1': 'Programming I',
                    'programming i': 'Programming I',
                    'programming 2': 'Programming II',
                    'Probability and Statistics 1': 'Probability and Statistics I',
                    'Probability and Statistics 2': 'Probability and Statistics II',
                    'data structure': 'Data Structures',
                    'calculus': 'Calculus',
                    'stochastic': 'Stochastic Processes',
                    'stochastic processes': 'Stochastic Processes'
                }
                
                # Check if this is a known course variation
                course_name = course_mappings.get(course_name.lower(), course_name)
                
                # Find course (flexible matching)
                course = self.courses.find_one({
                    "$or": [
                        {"name": {"$regex": f"^{course_name}$", "$options": "i"}},
                        {"name": {"$regex": course_name, "$options": "i"}},
                        {"code": {"$regex": course_name, "$options": "i"}}
                    ]
                })
                
                if course:
                    doctor = self.users.find_one({"id": course['doctorId'], "role": "doctor"})
                    if doctor:
                        return self.show_doctor_info(doctor, course)
                    return f"Could not find instructor for {course['name']}"
                return f"No course found matching '{course_name}'"
            
            # If no course specified, show all doctors
            doctors = self.get_user_info(role="doctor")
            if not doctors:
                return "No doctors found in the system."
            
            doctors_list = []
            for doc in doctors:
                doctors_list.append({
                    'ID': doc['id'],
                    'Name': doc['name'],
                    'Email': doc.get('email', 'N/A'),
                    'Department': doc.get('department', 'N/A')
                })
            
            df = pd.DataFrame(doctors_list)
            return df.to_string(index=False)
        
        # Other user information
        elif any(word in query_lower for word in ['user', 'student', 'ta']):
            role = "student" if 'student' in query_lower else ("ta" if 'ta' in query_lower else None)
            users = self.get_user_info(role=role)
            if not users:
                return f"No {role if role else 'users'} found."
            
            users_list = []
            for user in users:
                users_list.append({
                    'ID': user['id'],
                    'Name': user['name'],
                    'Email': user.get('email', 'N/A'),
                    'Role': user['role']
                })
            
            df = pd.DataFrame(users_list)
            return df.to_string(index=False)
        
        return f"""
        Hello {self.student_name}!
        I didn't understand your request. Here's what you can ask about:
        - 📢 Announcements
        - 📝 Complaints
        - 📚 Courses (search by name/code)
        - 📝 Exams
        - 📊 Grades
        - 👨‍🏫 Who teaches a course
        - 🗓️ My class schedule
        - 📅 when are my classes
        - 📖 What courses am I taking
        
        Examples: "show my courses", "what upcoming exams", "who teaches Calculus", 
        "when is my linear algebra class", "what's my schedule this semester", "info for Stochastic Processes"
        """

if __name__ == "__main__":
    chatbot = CollegeSystemChatbot()
    chatbot.chat()