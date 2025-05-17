import csv
import random
from datetime import datetime, timedelta
import json

# Sample Egyptian names (first and last)
first_names = [
    'Ahmed', 'Mohamed', 'Mahmoud', 'Khaled', 'Omar', 'Youssef', 'Karim', 'Tarek', 'Hassan', 'Ibrahim',
    'Fatima', 'Aya', 'Nour', 'Mariam', 'Layla', 'Yasmin', 'Rania', 'Dina', 'Noha', 'Hana'
]

last_names = [
    'Amr', 'Abdelrahman', 'Naguib', 'El-Baz', 'Fahmy', 'Gaber', 'Sabbagh', 'Mansour', 'Helmy', 'Saad',
    'El-Sherif', 'El-Masry', 'El-Sayed', 'El-Gharbawy', 'El-Kady', 'El-Shafei', 'El-Sherbiny', 'El-Maghrabi',
    'El-Husseiny', 'El-Desouky'
]

# CS Courses
cs_courses = [
    "02-24-00101",  # Introduction to Programming
    "02-24-00102",  # Computer Organization
    "02-24-00103",  # Data Structures
    "02-24-00104",  # Database Systems
    "02-24-00105",  # Operating Systems
    "02-24-00106",  # Software Engineering
    "02-24-00107",  # Computer Networks
    "02-24-00108",  # Artificial Intelligence
    "02-24-00109",  # Machine Learning
    "02-24-00110"   # Computer Vision
]


# Password hash placeholder (bcrypt)
hashed_password = "$2b$10$NrwKElb7ukptsFY49t4Gt.21dWcBNPmurAKGOVOLiI6X.krZyVjKG"

# Gender options
genders = ['Male', 'Female']

# Address options
addresses = [
    "123 El-Montaza Street, El-Montaza",
    "45 El-Miami Street, Sidi Gaber",
    "78 El-Horreya Road, El-Mandara",
    "90 El-Gaish Road, Agami",
    "12 El-Nasr Street, Smouha",
    "34 El-Horreya Avenue, Louran",
    "56 El-Gomhoreya Street, El-Raml",
    "78 El-Salam Street, Sidi Bishr",
    "90 El-Mahata Square, El-Mahata",
    "12 El-Shatby Street, El-Shatby",
    "34 El-Mansheya Square, El-Mansheya",
    "56 El-Safa Street, Kafr Abdo",
    "78 El-Seyouf Street, El-Ibrahimeya",
    "90 El-Maamoura Street, El-Maamoura",
    "12 El-Soudan Street, Sporting"
]

def generate_random_id():
    # Generate a random 7-digit number
    random_num = random.randint(1000000, 9999999)
    # Add a random letter prefix (A-Z)
    prefix = random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    return f"{prefix}{random_num}"

def generate_registered_courses():
    # Randomly select 4-6 courses for each student
    num_courses = random.randint(4, 6)
    selected_courses = random.sample(cs_courses, num_courses)
    return json.dumps(selected_courses)


def generate_cgpa():
    # Generate a random CGPA between 2.0 and 4.0
    cgpa = round(random.uniform(2.0, 4.0), 2)
    return json.dumps([{"term": "Fall 2023", "gpa": cgpa}])

def generate_fees():
    # Generate random fees between 10000 and 20000
    fees = random.randint(10000, 20000)
    return json.dumps([{"term": "Fall 2023", "amount": fees, "paid": random.choice([True, False])}])

# Generate random users
num_users = 50  # Increased number of users
users = []

for i in range(1, num_users + 1):
    first = random.choice(first_names)
    last = random.choice(last_names)
    name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower()}{i}@example.eg"
    user_id = generate_random_id()
    phone = f"+20100{random.randint(100000, 999999)}"
    dob = datetime.strptime("1990-01-01", "%Y-%m-%d") + timedelta(days=random.randint(0, 10000))
    gender = random.choice(genders)
    otp_expire = datetime.utcnow() + timedelta(days=random.randint(1, 30))
    address = random.choice(addresses)

    users.append({
        "name": name,
        "email": email,
        "id": user_id,
        "password": hashed_password,
        "phoneNumber": phone,
        "role": "student",
        "dateOfBirth": dob.strftime("%Y-%m-%d"),
        "gender": gender,
        "address": address,
        "isActive": True,
        "status": "Active",
        "registeredCourses": generate_registered_courses(),
        "registeredSections": "[]",
        "passedCourses": "[]",
        "assignedCourses": "[]",
        "assignedSections": "[]",
        "cgpa": generate_cgpa(),
        "fees": generate_fees(),
        "timetable": "[]",
        "__v": 0,
        "otpExpire": otp_expire.isoformat() + "Z",
        "profilePicture": ""
    })

# Write to CSV
csv_file = "egyptian_students.csv"
with open(csv_file, mode="w", newline='', encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=users[0].keys())
    writer.writeheader()
    for user in users:
        writer.writerow(user)

print(f"Generated {num_users} student records in {csv_file}")
