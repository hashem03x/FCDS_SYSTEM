# Student Performance Analysis System

This is a Flask-based web application that analyzes student performance data from MongoDB, providing insights into academic performance across different departments and academic levels.

## Features

- Overall student performance statistics
- Department-wise analysis
- Academic level-wise analysis
- Top 10 students per department
- Top 10 students per department and academic level combination
- RESTful API endpoint for data access

## Prerequisites

- Python 3.8 or higher
- MongoDB database
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

The application uses the following environment variables:
- `MONGO_URI`: MongoDB connection string
- `PORT`: Port number for the Flask application (default: 5000)

## Running the Application

1. Start the Flask server:
```bash
python analysis/student_analysis.py
```

2. Access the application:
- Web interface: http://localhost:5000
- API endpoint: http://localhost:5000/api/analysis

## API Endpoints

- `GET /`: Web interface
- `GET /api/analysis`: Returns JSON data containing all analysis results

## Deployment

The application can be deployed to any platform that supports Python applications (e.g., Heroku, AWS, etc.). The `Procfile` is included for Heroku deployment.

## Project Structure

```
.
├── analysis/
│   └── student_analysis.py
├── requirements.txt
├── Procfile
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 