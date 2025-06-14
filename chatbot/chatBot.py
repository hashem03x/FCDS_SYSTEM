from pymongo import MongoClient
from datetime import datetime
import pandas as pd
import re
from googletrans import Translator
import arabic_reshaper
from bidi.algorithm import get_display
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
from pytube import Search

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

        # Initialize translator
        self.translator = Translator()
        
        # Initialize TF-IDF vectorizer for text similarity
        self.vectorizer = TfidfVectorizer()
        
        # Define common intents and their keywords
        self.intent_patterns = {
            'greeting': [
                'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
                'مرحبا', 'السلام عليكم', 'اهلا', 'اهلا وسهلا', 'صباح الخير', 'مساء الخير'
            ],
            'farewell': [
                'bye', 'goodbye', 'see you', 'take care', 'until next time',
                'مع السلامة', 'الى اللقاء', 'وداعا', 'الى الملتقى'
            ],
            'thanks': [
                'thanks', 'thank you', 'appreciate it', 'much obliged',
                'شكرا', 'شكرا جزيلا', 'مشكور', 'مشكورة', 'يعطيك العافية'
            ],
            'how_are_you': [
                'how are you', 'how do you do', 'how\'s it going', 'how\'s everything',
                'كيف حالك', 'كيف الحال', 'كيفك', 'كيف حالك اليوم'
            ],
            'weather': [
                'weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy',
                'الطقس', 'درجة الحرارة', 'الجو', 'ممطر', 'مشمس', 'غائم'
            ],
            'time': [
                'time', 'what time', 'current time', 'clock',
                'الساعة', 'كم الساعة', 'الوقت', 'التوقيت'
            ],
            'date': [
                'date', 'what day', 'today', 'tomorrow', 'yesterday',
                'التاريخ', 'اليوم', 'غدا', 'البارحة'
            ],
            'joke': [
                'joke', 'funny', 'humor', 'laugh',
                'نكتة', 'ضحك', 'فكاهة', 'طرفة'
            ],
            'help': [
                'help', 'what can you do', 'capabilities', 'features',
                'مساعدة', 'ماذا تستطيع', 'قدراتك', 'مميزاتك'
            ],
            'name': [
                'what is your name', 'who are you', 'your name',
                'ما اسمك', 'من انت', 'تعريف نفسك'
            ],
            'age': [
                'how old are you', 'your age', 'when were you born',
                'كم عمرك', 'عمرك', 'متى ولدت'
            ],
            'purpose': [
                'what do you do', 'why are you here', 'your purpose',
                'ماذا تفعل', 'لماذا انت هنا', 'هدفك'
            ],
            'mood': [
                'how do you feel', 'are you happy', 'your mood',
                'كيف تشعر', 'هل انت سعيد', 'مزاجك'
            ],
            'course_information': [
                'course', 'class', 'subject', 'مادة', 'كورس',
                'tell me about', 'what is', 'show me', 'info'
            ],
            'schedule_information': [
                'schedule', 'timetable', 'when', 'time', 'جدول',
                'مواعيد', 'متى', 'وقت'
            ],
            'grade_information': [
                'grade', 'score', 'result', 'mark', 'درجة',
                'نتيجة', 'علامة'
            ],
            'exam_information': [
                'exam', 'test', 'quiz', 'امتحان', 'اختبار'
            ],
            'announcement_information': [
                'announcement', 'news', 'update', 'إعلان',
                'خبر', 'تحديث'
            ],
            'complaint_information': [
                'complaint', 'issue', 'problem', 'شكوى',
                'مشكلة'
            ],
            'prerequisite_information': [
                'prerequisite', 'requirement', 'need', 'متطلب',
                'شرط'
            ],
            'elective_course_information': [
                'elective', 'optional', 'اختياري', 'اختيارية'
            ],
            'professor_information': [
                'professor', 'doctor', 'teacher', 'instructor',
                'أستاذ', 'دكتور', 'مدرس'
            ],
            'study_help': [
                'help me study', 'learn', 'tutorial', 'explain', 'teach me', 'how to',
                'ساعدني في الدراسة', 'شرح', 'تعليم', 'كيف اتعلم', 'دروس', 'شرح'
            ],
            'youtube_search': [
                'youtube', 'video', 'watch', 'search', 'find video',
                'يوتيوب', 'فيديو', 'شاهد', 'ابحث', 'اعثر على فيديو'
            ]
        }

        # Define responses for conversational intents
        self.conversation_responses = {
            'greeting': {
                'en': [
                    "Hello! How can I help you today?",
                    "Hi! What can I do for you?",
                    "Greetings! How may I assist you?"
                ],
                'ar': [
                    "مرحبا! كيف يمكنني مساعدتك اليوم؟",
                    "اهلا! كيف يمكنني خدمتك؟",
                    "السلام عليكم! كيف يمكنني مساعدتك؟"
                ]
            },
            'farewell': {
                'en': [
                    "Goodbye! Have a great day!",
                    "See you later! Take care!",
                    "Until next time! Good luck with your studies!"
                ],
                'ar': [
                    "مع السلامة! اتمنى لك يوما سعيدا!",
                    "الى اللقاء! اعتني بنفسك!",
                    "الى الملتقى! بالتوفيق في دراستك!"
                ]
            },
            'thanks': {
                'en': [
                    "You're welcome!",
                    "My pleasure!",
                    "Happy to help!"
                ],
                'ar': [
                    "العفو!",
                    "على الرحب والسعة!",
                    "سعيد بمساعدتك!"
                ]
            },
            'how_are_you': {
                'en': [
                    "I'm doing well, thank you for asking! How can I help you today?",
                    "I'm great! What can I do for you?",
                    "All good here! How may I assist you?"
                ],
                'ar': [
                    "بخير والحمد لله! كيف يمكنني مساعدتك اليوم؟",
                    "ممتاز! كيف يمكنني خدمتك؟",
                    "كل شيء على ما يرام! كيف يمكنني مساعدتك؟"
                ]
            },
            'weather': {
                'en': [
                    "I'm sorry, I don't have access to real-time weather information. You might want to check a weather app or website for accurate forecasts.",
                    "I can't check the weather right now, but I hope it's nice where you are!",
                    "I don't have weather data, but I can help you with other things!"
                ],
                'ar': [
                    "عذراً، ليس لدي إمكانية الوصول إلى معلومات الطقس المباشرة. يمكنك التحقق من تطبيق أو موقع الطقس للحصول على توقعات دقيقة.",
                    "لا يمكنني التحقق من الطقس الآن، لكنني أتمنى أن يكون الجو جميلاً حيث أنت!",
                    "ليس لدي بيانات الطقس، لكن يمكنني مساعدتك في أمور أخرى!"
                ]
            },
            'time': {
                'en': [
                    f"The current time is {datetime.now().strftime('%I:%M %p')}.",
                    f"It's {datetime.now().strftime('%I:%M %p')} right now.",
                    f"Right now it's {datetime.now().strftime('%I:%M %p')}."
                ],
                'ar': [
                    f"الساعة الآن {datetime.now().strftime('%I:%M %p')}.",
                    f"الوقت الحالي هو {datetime.now().strftime('%I:%M %p')}.",
                    f"حالياً الساعة {datetime.now().strftime('%I:%M %p')}."
                ]
            },
            'date': {
                'en': [
                    f"Today is {datetime.now().strftime('%A, %B %d, %Y')}.",
                    f"It's {datetime.now().strftime('%A, %B %d, %Y')} today.",
                    f"The date is {datetime.now().strftime('%A, %B %d, %Y')}."
                ],
                'ar': [
                    f"اليوم هو {datetime.now().strftime('%A, %B %d, %Y')}.",
                    f"التاريخ اليوم هو {datetime.now().strftime('%A, %B %d, %Y')}.",
                    f"نحن في {datetime.now().strftime('%A, %B %d, %Y')}."
                ]
            },
            'joke': {
                'en': [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "What do you call a fake noodle? An impasta!",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!"
                ],
                'ar': [
                    "لماذا لا يثق العلماء بالذرات؟ لأنها تتكون من كل شيء!",
                    "ماذا تسمي المعكرونة المزيفة؟ معكرونة مزيفة!",
                    "لماذا فاز الفزاعة بجائزة؟ لأنه كان متميزاً في مجاله!"
                ]
            },
            'help': {
                'en': [
                    "I can help you with:\n- College information (courses, grades, schedule)\n- General conversation\n- Time and date\n- Jokes and fun facts\n- And much more! Just ask!",
                    "I'm here to help with:\n- Academic information\n- Casual conversation\n- Basic information\n- Entertainment\nWhat would you like to know?",
                    "I can assist you with various topics:\n- College-related queries\n- General knowledge\n- Time and weather\n- Fun interactions\nHow can I help you today?"
                ],
                'ar': [
                    "يمكنني مساعدتك في:\n- معلومات الكلية (الدورات، الدرجات، الجدول)\n- المحادثة العامة\n- الوقت والتاريخ\n- النكت والحقائق الممتعة\n- والمزيد! فقط اسأل!",
                    "أنا هنا للمساعدة في:\n- المعلومات الأكاديمية\n- المحادثة العادية\n- المعلومات الأساسية\n- الترفيه\nماذا تريد أن تعرف؟",
                    "يمكنني مساعدتك في مواضيع مختلفة:\n- استفسارات الكلية\n- المعرفة العامة\n- الوقت والطقس\n- التفاعلات الممتعة\nكيف يمكنني مساعدتك اليوم؟"
                ]
            },
            'name': {
                'en': [
                    "I'm the College System Chatbot, but you can call me CollegeBot!",
                    "My name is CollegeBot, and I'm here to help you!",
                    "I'm CollegeBot, your friendly college assistant!"
                ],
                'ar': [
                    "أنا روبوت نظام الكلية، لكن يمكنك مناداتي كوليج بوت!",
                    "اسمي كوليج بوت، وأنا هنا لمساعدتك!",
                    "أنا كوليج بوت، مساعدك الودود في الكلية!"
                ]
            },
            'age': {
                'en': [
                    "I'm a computer program, so I don't have an age in the traditional sense. I was created to help students!",
                    "As an AI, I don't have an age, but I'm always learning and growing!",
                    "I'm timeless! I exist to help students like you!"
                ],
                'ar': [
                    "أنا برنامج كمبيوتر، لذا ليس لدي عمر بالمعنى التقليدي. تم إنشائي لمساعدة الطلاب!",
                    "كذكاء اصطناعي، ليس لدي عمر، لكنني أتعلم وأتطور دائماً!",
                    "أنا خالد! أنا موجود لمساعدة طلاب مثلك!"
                ]
            },
            'purpose': {
                'en': [
                    "I'm here to help students with their college-related questions and provide general assistance!",
                    "My purpose is to make your college experience easier by answering questions and providing information!",
                    "I'm designed to help students navigate college life and answer their questions!"
                ],
                'ar': [
                    "أنا هنا لمساعدة الطلاب في أسئلتهم المتعلقة بالكلية وتقديم المساعدة العامة!",
                    "هدفي هو تسهيل تجربة الكلية عليك من خلال الإجابة على الأسئلة وتقديم المعلومات!",
                    "تم تصميمي لمساعدة الطلاب في التنقل في حياة الكلية والإجابة على أسئلتهم!"
                ]
            },
            'mood': {
                'en': [
                    "I'm feeling great and ready to help! How about you?",
                    "I'm in a good mood and excited to assist you!",
                    "I'm feeling positive and ready for our conversation!"
                ],
                'ar': [
                    "أشعر بأنني بحالة جيدة ومستعد للمساعدة! ماذا عنك؟",
                    "أنا في مزاج جيد ومتحمس لمساعدتك!",
                    "أشعر بالإيجابية ومستعد لمحادثتنا!"
                ]
            },
            'study_help': {
                'en': [
                    "I'll help you find some educational videos on YouTube. What topic would you like to learn about?",
                    "I can search for helpful tutorials on YouTube. What subject do you need help with?",
                    "Let me find some educational content for you. What would you like to learn?"
                ],
                'ar': [
                    "سأساعدك في العثور على بعض الفيديوهات التعليمية على يوتيوب. ما هو الموضوع الذي تريد التعلم عنه؟",
                    "يمكنني البحث عن دروس مفيدة على يوتيوب. ما هو الموضوع الذي تحتاج مساعدة فيه؟",
                    "دعني أجد بعض المحتوى التعليمي لك. ماذا تريد أن تتعلم؟"
                ]
            }
        }

    def detect_language(self, text):
        """Detect if the text is in Arabic or English"""
        # Simple heuristic: check for Arabic characters
        arabic_pattern = re.compile('[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')
        return 'ar' if arabic_pattern.search(text) else 'en'

    def translate_text(self, text, target_lang='en'):
        """Translate text between Arabic and English"""
        try:
            result = self.translator.translate(text, dest=target_lang)
            return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text

    def process_arabic_text(self, text):
        """Process Arabic text for display"""
        reshaped_text = arabic_reshaper.reshape(text)
        return get_display(reshaped_text)

    def classify_intent(self, query):
        """Classify the intent of the user's query using keyword matching"""
        query_lower = query.lower()
        
        # Calculate similarity scores for each intent
        intent_scores = {}
        for intent, patterns in self.intent_patterns.items():
            # Count how many keywords from this intent appear in the query
            score = sum(1 for pattern in patterns if pattern.lower() in query_lower)
            intent_scores[intent] = score
        
        # Get the intent with the highest score
        if intent_scores:
            max_intent = max(intent_scores.items(), key=lambda x: x[1])
            return max_intent[0] if max_intent[1] > 0 else None
        return None

    def extract_entities(self, query):
        """Extract relevant entities from the query"""
        entities = {
            'course_name': None,
            'course_code': None,
            'date': None,
            'professor_name': None
        }

        # Extract course code (format: XX-XX-XXXXX)
        course_code_pattern = r'\d{2}-\d{2}-\d{5}'
        course_code_match = re.search(course_code_pattern, query)
        if course_code_match:
            entities['course_code'] = course_code_match.group(0)

        # Extract course name using keyword matching
        course_keywords = ['course', 'class', 'subject', 'مادة', 'كورس']
        words = query.split()
        for i, word in enumerate(words):
            if word.lower() in course_keywords and i + 1 < len(words):
                # Try to get 2-3 words after the keyword as the course name
                potential_name = ' '.join(words[i+1:i+3])
                if potential_name:
                    entities['course_name'] = potential_name

        return entities

    def get_conversation_response(self, intent, lang='en'):
        """Get a random response for conversational intents"""
        responses = self.conversation_responses.get(intent, {}).get(lang, [])
        return random.choice(responses) if responses else None

    def search_youtube(self, query, max_results=5):
        """Search YouTube for educational content"""
        try:
            # Add educational keywords to improve search results
            search_query = f"{query} tutorial educational learn"
            
            # Create a search object
            search = Search(search_query)
            
            results = []
            count = 0
            
            # Get the first page of results
            for video in search.results:
                if count >= max_results:
                    break
                    
                try:
                    # Basic video information that's always available
                    video_data = {
                        'title': video.title,
                        'url': f"https://www.youtube.com/watch?v={video.video_id}",
                        'author': video.author,
                        'duration': 0,  # Default duration
                        'views': 0     # Default views
                    }
                    
                    # Try to get additional information
                    try:
                        video_data['duration'] = video.length
                    except:
                        pass
                        
                    try:
                        video_data['views'] = video.views
                    except:
                        pass
                    
                    results.append(video_data)
                    count += 1
                    
                except Exception as e:
                    print(f"Error processing video: {e}")
                    continue
            
            return results if results else None
            
        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return None

    def format_youtube_results(self, results, lang='en'):
        """Format YouTube search results for display"""
        if not results:
            return {
                'type': 'text',
                'content': {
                    'en': "I'm having trouble finding videos right now. Please try again in a moment.",
                    'ar': "أواجه مشكلة في العثور على الفيديوهات الآن. يرجى المحاولة مرة أخرى بعد قليل."
                }[lang]
            }

        # Create a structured response with type "links"
        response = {
            'type': 'links',
            'content': {
                'title': {
                    'en': "Here are some helpful videos I found:",
                    'ar': "إليك بعض الفيديوهات المفيدة التي وجدتها:"
                }[lang],
                'videos': []
            }
        }

        for video in results:
            duration = video.get('duration', 0)
            duration_min = duration // 60 if duration else 0
            duration_sec = duration % 60 if duration else 0
            views = video.get('views', 0)
            
            video_info = {
                'title': video.get('title', 'Untitled'),
                'author': video.get('author', 'Unknown'),
                'url': video.get('url', ''),
                'duration': f"{duration_min}:{duration_sec:02d}" if duration else None,
                'views': views
            }
            
            response['content']['videos'].append(video_info)

        return response

    def process_query(self, query):
        """Enhanced query processing with NLP capabilities"""
        # Detect language
        lang = self.detect_language(query)
        
        # Translate if necessary
        if lang == 'ar':
            translated_query = self.translate_text(query)
        else:
            translated_query = query

        # Check for study help or YouTube search intent
        study_help_patterns = ['help me study', 'learn', 'tutorial', 'explain', 'teach me', 'how to',
                             'ساعدني في الدراسة', 'شرح', 'تعليم', 'كيف اتعلم', 'دروس', 'شرح']
        youtube_patterns = ['youtube', 'video', 'watch', 'search', 'find video',
                          'يوتيوب', 'فيديو', 'شاهد', 'ابحث', 'اعثر على فيديو']

        # Check if the query contains study help patterns
        if any(pattern in translated_query.lower() for pattern in study_help_patterns):
            # Extract the topic from the query
            topic = re.sub('|'.join(study_help_patterns), '', translated_query, flags=re.IGNORECASE).strip()
            if topic:
                results = self.search_youtube(topic)
                return self.format_youtube_results(results, lang)
            else:
                return {
                    'en': "What topic would you like to learn about?",
                    'ar': "ما هو الموضوع الذي تريد التعلم عنه؟"
                }[lang]

        # Check if the query contains YouTube search patterns
        if any(pattern in translated_query.lower() for pattern in youtube_patterns):
            # Extract the search query
            search_query = re.sub('|'.join(youtube_patterns), '', translated_query, flags=re.IGNORECASE).strip()
            if search_query:
                results = self.search_youtube(search_query)
                return self.format_youtube_results(results, lang)
            else:
                return {
                    'en': "What would you like to search for on YouTube?",
                    'ar': "ماذا تريد البحث عنه على يوتيوب؟"
                }[lang]

        # Classify intent for other queries
        intent = self.classify_intent(translated_query)
        
        # Handle other intents
        if intent in self.conversation_responses:
            return self.get_conversation_response(intent, lang)
        
        # If no specific intent is matched, try to find the most similar question
        try:
            # Get all possible questions from the database
            all_questions = self.get_all_possible_questions()
            
            # Vectorize the questions and the query
            questions_vectorized = self.vectorizer.fit_transform(all_questions + [translated_query])
            
            # Calculate similarity between query and all questions
            similarity_scores = cosine_similarity(questions_vectorized[-1:], questions_vectorized[:-1])[0]
            
            # Get the most similar question
            most_similar_idx = similarity_scores.argmax()
            if similarity_scores[most_similar_idx] > 0.3:  # Threshold for similarity
                return self.answer_question(all_questions[most_similar_idx])
            
            # If no similar question is found, provide a general response
            general_responses = {
                'en': [
                    "I'm not sure I understand. Could you please rephrase that?",
                    "I'm still learning. Could you try asking that differently?",
                    "I'm not quite sure what you mean. Can you explain differently?"
                ],
                'ar': [
                    "أنا لست متأكداً من فهمي. هل يمكنك إعادة صياغة ذلك؟",
                    "أنا ما زلت أتعلم. هل يمكنك طرح السؤال بطريقة مختلفة؟",
                    "أنا لست متأكداً تماماً مما تعنيه. هل يمكنك الشرح بطريقة مختلفة؟"
                ]
            }
            return random.choice(general_responses[lang])
        except Exception as e:
            print(f"Error processing query: {e}")
            return "I'm sorry, I couldn't understand your question. Could you please rephrase it?"

    def get_all_possible_questions(self):
        """Get a list of all possible questions from the database"""
        questions = []
        
        # Add course-related questions
        courses = self.get_courses()
        for course in courses:
            questions.extend([
                f"What is {course['name']}?",
                f"Tell me about {course['name']}",
                f"Who teaches {course['name']}?",
                f"When is {course['name']} scheduled?",
                f"What are the prerequisites for {course['name']}?"
            ])
        
        # Add schedule-related questions
        questions.extend([
            "What is my schedule?",
            "When are my classes?",
            "Show me my timetable",
            "What classes do I have today?"
        ])
        
        # Add grade-related questions
        questions.extend([
            "What are my grades?",
            "Show me my results",
            "How did I do in my courses?"
        ])
        
        return questions

    def answer_question(self, question):
        """Answer a specific question based on its type"""
        question_lower = question.lower()
        
        if "what is" in question_lower or "tell me about" in question_lower:
            # Extract course name
            course_name = re.sub(r'(what is|tell me about)\s*', '', question_lower).strip('?')
            courses = self.get_courses_by_name(course_name)
            return self.show_courses(courses)
            
        elif "who teaches" in question_lower:
            course_name = re.sub(r'who teaches\s*', '', question_lower).strip('?')
            courses = self.get_courses_by_name(course_name)
            if courses:
                course = courses[0]
                doctor = self.users.find_one({"id": course['doctorId'], "role": "doctor"})
                return self.show_doctor_info(doctor, course)
                
        elif "when is" in question_lower or "scheduled" in question_lower:
            course_name = re.sub(r'(when is|scheduled)\s*', '', question_lower).strip('?')
            courses = self.get_courses_by_name(course_name)
            if courses:
                return self.show_course_detail(courses[0])
                
        elif "prerequisites" in question_lower:
            course_name = re.sub(r'what are the prerequisites for\s*', '', question_lower).strip('?')
            courses = self.get_courses_by_name(course_name)
            if courses:
                completed, missing, message = self.check_prerequisites(self.student_id, courses[0]['code'])
                return f"Prerequisites check: {message}\nMissing: {', '.join(missing) if missing else 'None'}"
                
        elif "schedule" in question_lower or "classes" in question_lower:
            schedule = self.get_student_schedule(self.student_id)
            return self.show_schedule(schedule)
            
        elif "grades" in question_lower or "results" in question_lower:
            grades = self.get_grades(self.student_id)
            return self.show_grades(grades)
            
        return "I'm sorry, I couldn't find a specific answer to that question."

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
        - 📋 Check prerequisites for a course
        - 🎯 Elective courses
        
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
        - what are the prerequisites for Data Structures
        - have I completed prerequisites for Programming II
        - show elective courses
        - المواد الاختيارية
        
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
    
    # NEW: Check if student has completed prerequisites for a course
    def check_prerequisites(self, student_id, course_code):
        """Check if student has completed prerequisites for a course"""
        course = self.courses.find_one({"code": course_code})
        if not course:
            return False, [], "Course not found"
        
        # Get list of prerequisites
        prerequisites = course.get('prerequisites', [])
        if not prerequisites:
            return True, [], "No prerequisites required"
        
        # Get student's completed courses with passing grades
        passed_courses = set()
        for grade in self.grades.find({"studentId": student_id}):
            try:
                # Convert score to float and check if passing
                if float(grade.get('score', 0)) >= 60.0:
                    passed_courses.add(grade['courseCode'])
            except ValueError:
                continue
        
        # Check which prerequisites are missing
        missing = []
        for prereq in prerequisites:
            if prereq not in passed_courses:
                # Get course name for better display
                prereq_course = self.courses.find_one({"code": prereq})
                if prereq_course:
                    missing.append(f"{prereq_course['name']} ({prereq})")
                else:
                    missing.append(prereq)
        
        if missing:
            return False, missing, f"You have not completed {len(missing)} prerequisite(s)"
        return True, [], "All prerequisites completed"
    
    # NEW: Get elective courses - FIXED VERSION
    def get_elective_courses(self):
        """Get elective courses from database - fixed version"""
        # First check if the 'type' field exists at all
        if self.courses.count_documents({"type": {"$exists": True}}) == 0:
            return None  # Special flag indicating field doesn't exist
        
        # Case-insensitive search for elective courses
        return list(self.courses.find({
            "type": {"$regex": "elective", "$options": "i"},
            "isActive": True
        }))
    
    # NEW: Show elective courses with proper error handling
    def show_elective_courses(self, elective_courses):
        """Display elective courses with proper error handling"""
        if elective_courses is None:
            return """
            Error: 'type' Field Not Found
            The database does not have a 'type' field to identify elective courses.
            Please contact system administrator to fix this issue.
            """
        
        if not elective_courses:
            return """
            No Elective Courses Found
            There are currently no active elective courses available.
            Please check back later or contact the academic department.
            """
        
        return self.show_courses(elective_courses, title="Elective Courses")
    
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
            course_type = course.get('type', 'core').capitalize() if course.get('type') else 'Core'
            courses_list.append({
                'Code': course['code'],
                'Name': course['name'],
                'Doctor': doctor_name,
                'Department': course['department'],
                'Credit Hours': course.get('creditHours', 'N/A'),
                'Semester': course.get('semester', 'N/A'),
                'Type': course_type
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
        
        course_type = course.get('type', 'core').capitalize() if course.get('type') else 'Core'
        
        details = f"""
        {course['code']}: {course['name']}
        Instructor: {doctor['name']}
        Department: {course['department']}
        Credit Hours: {course['creditHours']}
        Semester: {course['semester']}
        Type: {course_type}
        """
        
        # Show prerequisites if available
        if 'prerequisites' in course and course['prerequisites']:
            details += "\nPrerequisites:\n"
            for prereq_code in course['prerequisites']:
                prereq_course = self.courses.find_one({"code": prereq_code})
                if prereq_course:
                    details += f"- {prereq_course['name']} ({prereq_code})\n"
                else:
                    details += f"- {prereq_code}\n"
        else:
            details += "\nPrerequisites: None\n"
        
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

if __name__ == "__main__":
    chatbot = CollegeSystemChatbot()
    chatbot.chat()