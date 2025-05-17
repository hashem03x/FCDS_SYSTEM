// Sample data for CS Faculty grades
const sampleData = {
  // Egyptian Student Names
  students: [
    { id: "2021001", name: "Ahmed Mohamed Hassan" },
    { id: "2021002", name: "Mohamed Ali Ibrahim" },
    { id: "2021003", name: "Fatima Mahmoud Abdelrahman" },
    { id: "2021004", name: "Youssef Ahmed El-Sayed" },
    { id: "2021005", name: "Nour Hassan Mostafa" },
    { id: "2021006", name: "Omar Khaled Mohamed" },
    { id: "2021007", name: "Mariam Ahmed Hassan" },
    { id: "2021008", name: "Karim Mahmoud Ali" },
    { id: "2021009", name: "Layla Mohamed Ibrahim" },
    { id: "2021010", name: "Ziad Ahmed Hassan" }
  ],

  // CS Courses
  courses: [
    { code: "CS101", name: "Introduction to Programming", credits: 3 },
    { code: "CS102", name: "Computer Organization", credits: 3 },
    { code: "CS201", name: "Data Structures", credits: 4 },
    { code: "CS202", name: "Database Systems", credits: 3 },
    { code: "CS203", name: "Operating Systems", credits: 3 },
    { code: "CS301", name: "Software Engineering", credits: 3 },
    { code: "CS302", name: "Computer Networks", credits: 3 },
    { code: "CS303", name: "Artificial Intelligence", credits: 4 },
    { code: "CS401", name: "Machine Learning", credits: 4 },
    { code: "CS402", name: "Computer Vision", credits: 3 }
  ],

  // Terms
  terms: ["Fall 2023", "Spring 2024", "Fall 2024", "Spring 2025"],

  // Generate random grades
  generateGrades: function() {
    const grades = [];
    const gradeRanges = {
      "A+": [95, 100],
      "A": [90, 94],
      "A-": [85, 89],
      "B+": [80, 84],
      "B": [75, 79],
      "B-": [70, 74],
      "C+": [65, 69],
      "C": [60, 64],
      "C-": [55, 59],
      "D+": [50, 54],
      "D": [45, 49],
      "D-": [40, 44],
      "F": [0, 39]
    };

    this.students.forEach(student => {
      this.courses.forEach(course => {
        this.terms.forEach(term => {
          // Randomly decide if this is a retake (10% chance)
          const isRetake = Math.random() < 0.1;
          const attemptNumber = isRetake ? Math.floor(Math.random() * 2) + 1 : 1;

          // Generate random score
          const score = Math.floor(Math.random() * 101);
          
          // Determine grade based on score
          let grade = "F";
          for (const [g, [min, max]] of Object.entries(gradeRanges)) {
            if (score >= min && score <= max) {
              grade = g;
              break;
            }
          }

          // Generate random date within the term
          const termYear = parseInt(term.split(" ")[1]);
          const isFall = term.startsWith("Fall");
          const month = isFall ? 12 : 6;
          const day = Math.floor(Math.random() * 28) + 1;
          const dateGraded = `${termYear}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

          grades.push({
            studentId: student.id,
            courseCode: course.code,
            courseName: course.name,
            score: score,
            grade: grade,
            term: term,
            dateGraded: dateGraded,
            creditHours: course.credits,
            isRetake: isRetake,
            attemptNumber: attemptNumber
          });
        });
      });
    });

    return grades;
  }
};

// Export the data
export default sampleData; 