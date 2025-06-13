import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Chip,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faFileExcel,
  faChartBar,
  faChartPie,
  faChartLine,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import * as XLSX from 'xlsx';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, PointElement, LineElement);

const terms = ["Spring 2025", "Fall 2024", "Spring 2024", "Fall 2023"];
const gradeColors = {
  "A+": "#2e7d32",
  "A": "#43a047",
  "A-": "#66bb6a",
  "B+": "#1976d2",
  "B": "#1e88e5",
  "B-": "#42a5f5",
  "C+": "#f57c00",
  "C": "#fb8c00",
  "C-": "#ffa726",
  "D+": "#d32f2f",
  "D": "#e53935",
  "D-": "#ef5350",
  "F": "#b71c1c",
};

export default function Grades() {
  const { authToken } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "dateGraded",
    direction: "desc",
  });
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const chartRef = useRef(null);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/gpa/get-all-grades`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      setGrades(data.data.grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortedData = () => {
    const filteredData = grades.filter((grade) => {
      const matchesSearch =
        grade.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTerm = selectedTerm ? grade.term === selectedTerm : true;
      return matchesSearch && matchesTerm;
    });

    return filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === "dateGraded") {
        return sortConfig.direction === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportToExcel = () => {
    const dataToExport = getSortedData().map(grade => ({
      'Student ID': grade.studentId,
      'Course Code': grade.courseCode,
      'Course Name': grade.courseName,
      'Score': grade.score,
      'Grade': grade.grade,
      'Term': grade.term,
      'Date Graded': formatDate(grade.dateGraded),
      'Credit Hours': grade.creditHours,
      'Is Retake': grade.isRetake ? 'Yes' : 'No',
      'Attempt Number': grade.attemptNumber,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grades_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateGradeDistribution = () => {
    const gradeCounts = {};
    grades.forEach(grade => {
      gradeCounts[grade.grade] = (gradeCounts[grade.grade] || 0) + 1;
    });

    return {
      labels: Object.keys(gradeCounts),
      datasets: [{
        data: Object.values(gradeCounts),
        backgroundColor: Object.keys(gradeCounts).map(grade => gradeColors[grade] || '#757575'),
        borderWidth: 1,
      }]
    };
  };

  const generateTermPerformance = () => {
    const termData = {};
    terms.forEach(term => {
      const termGrades = grades.filter(g => g.term === term);
      const avgScore = termGrades.reduce((acc, curr) => acc + curr.score, 0) / termGrades.length;
      termData[term] = avgScore;
    });

    return {
      labels: Object.keys(termData),
      datasets: [{
        label: 'Average Score',
        data: Object.values(termData),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      }]
    };
  };

  const generateCoursePerformance = () => {
    const courseData = {};
    grades.forEach(grade => {
      if (!courseData[grade.courseCode]) {
        courseData[grade.courseCode] = {
          total: 0,
          count: 0,
          name: grade.courseName
        };
      }
      courseData[grade.courseCode].total += grade.score;
      courseData[grade.courseCode].count += 1;
    });

    const sortedCourses = Object.entries(courseData)
      .map(([code, data]) => ({
        code,
        name: data.name,
        average: data.total / data.count
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    return {
      labels: sortedCourses.map(c => c.code),
      datasets: [{
        label: 'Average Score',
        data: sortedCourses.map(c => c.average),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      }]
    };
  };

  const handleDownloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${selectedChart}_chart_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderChart = () => {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: selectedChart === 'distribution' ? 'Grade Distribution' :
                selectedChart === 'term' ? 'Term Performance' :
                'Top 10 Courses by Average Score',
        },
      },
    };

    switch (selectedChart) {
      case 'distribution':
        return <Pie data={generateGradeDistribution()} options={options} />;
      case 'term':
        return <Line data={generateTermPerformance()} options={options} />;
      case 'course':
        return <Bar data={generateCoursePerformance()} options={options} />;
      default:
        return null;
    }
  };

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FontAwesomeIcon icon={faGraduationCap} />
          Student Grades
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faChartBar} />}
            onClick={() => {
              setSelectedChart('distribution');
              setChartDialogOpen(true);
            }}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.2s'
            }}
          >
            View Charts
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
            onClick={handleExportToExcel}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.2s'
            }}
          >
            Export to Excel
          </Button>
        </Stack>
      </Stack>

      <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by Student ID, Course Code, or Course Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Terms</MenuItem>
              {terms.map((term) => (
                <MenuItem key={term} value={term}>
                  {term}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Student ID</span>
                    <IconButton size="small" onClick={() => handleSort("studentId")}>
                      <FontAwesomeIcon icon={getSortIcon("studentId")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Course Code</span>
                    <IconButton size="small" onClick={() => handleSort("courseCode")}>
                      <FontAwesomeIcon icon={getSortIcon("courseCode")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Course Name</span>
                    <IconButton size="small" onClick={() => handleSort("courseName")}>
                      <FontAwesomeIcon icon={getSortIcon("courseName")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Score</span>
                    <IconButton size="small" onClick={() => handleSort("score")}>
                      <FontAwesomeIcon icon={getSortIcon("score")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Grade</span>
                    <IconButton size="small" onClick={() => handleSort("grade")}>
                      <FontAwesomeIcon icon={getSortIcon("grade")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Term</span>
                    <IconButton size="small" onClick={() => handleSort("term")}>
                      <FontAwesomeIcon icon={getSortIcon("term")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Date Graded</span>
                    <IconButton size="small" onClick={() => handleSort("dateGraded")}>
                      <FontAwesomeIcon icon={getSortIcon("dateGraded")} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Credit Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedData().map((grade) => (
                <TableRow
                  key={grade._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell>{grade.studentId}</TableCell>
                  <TableCell>{grade.courseCode}</TableCell>
                  <TableCell>{grade.courseName}</TableCell>
                  <TableCell>{grade.score}</TableCell>
                  <TableCell>
                    <Chip
                      label={grade.grade}
                      sx={{
                        backgroundColor: gradeColors[grade.grade] || "#757575",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>{grade.term}</TableCell>
                  <TableCell>{formatDate(grade.dateGraded)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {grade.isRetake && (
                        <Chip
                          label={`Retake #${grade.attemptNumber}`}
                          color="warning"
                          size="small"
                        />
                      )}
                      {grade.creditHours && (
                        <Chip
                          label={`${grade.creditHours} Credits`}
                          color="info"
                          size="small"
                        />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={chartDialogOpen}
        onClose={() => setChartDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Grade Analytics</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faChartPie} />}
                onClick={() => setSelectedChart('distribution')}
                color={selectedChart === 'distribution' ? 'primary' : 'inherit'}
              >
                Distribution
              </Button>
              <Button
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faChartLine} />}
                onClick={() => setSelectedChart('term')}
                color={selectedChart === 'term' ? 'primary' : 'inherit'}
              >
                Term Performance
              </Button>
              <Button
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faChartBar} />}
                onClick={() => setSelectedChart('course')}
                color={selectedChart === 'course' ? 'primary' : 'inherit'}
              >
                Course Performance
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box ref={chartRef} sx={{ p: 2, minHeight: 400 }}>
            {renderChart()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<FontAwesomeIcon icon={faDownload} />}
            onClick={handleDownloadChart}
            variant="contained"
            color="primary"
          >
            Download Chart
          </Button>
          <Button onClick={() => setChartDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}