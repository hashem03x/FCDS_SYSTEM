import XLSX from 'xlsx';
import sampleData from './sample_data';

// Generate the grades data
const grades = sampleData.generateGrades();

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert the grades data to a worksheet
const worksheet = XLSX.utils.json_to_sheet(grades);

// Set column widths
const columnWidths = [
  { wch: 10 }, // studentId
  { wch: 8 },  // courseCode
  { wch: 30 }, // courseName
  { wch: 6 },  // score
  { wch: 6 },  // grade
  { wch: 12 }, // term
  { wch: 12 }, // dateGraded
  { wch: 8 },  // creditHours
  { wch: 8 },  // isRetake
  { wch: 8 }   // attemptNumber
];
worksheet['!cols'] = columnWidths;

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");

// Write the workbook to file
XLSX.writeFile(workbook, "grades_template.xlsx"); 