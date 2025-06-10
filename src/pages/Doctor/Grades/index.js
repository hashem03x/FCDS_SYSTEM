import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import { useDoctor } from "../../../context/DoctorContext";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faSearch, faTrophy, faMedal } from "@fortawesome/free-solid-svg-icons";

function Grades() {
  const { courses, isLoading, error } = useDoctor();
  const { authToken } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [gradeData, setGradeData] = useState({
    studentId: "",
    courseCode: "",
    score: "",
  });
  const [uploading, setUploading] = useState(false);
  const [courseGrades, setCourseGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGrades, setFilteredGrades] = useState([]);

  // Calculate statistics
  const calculateStats = () => {
    if (!courseGrades.length) return null;

    const sortedGrades = [...courseGrades].sort((a, b) => b.score - a.score);
    const highestGrades = sortedGrades.slice(0, 3);
    const lowestGrades = sortedGrades.slice(-3).reverse();

    const average = courseGrades.reduce((acc, grade) => acc + grade.score, 0) / courseGrades.length;
    const passingCount = courseGrades.filter(grade => grade.score >= 60).length;
    const failingCount = courseGrades.filter(grade => grade.score < 60).length;

    return {
      highestGrades,
      lowestGrades,
      average: average.toFixed(2),
      passingCount,
      failingCount,
      totalStudents: courseGrades.length
    };
  };

  const stats = calculateStats();

  // Filter grades based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGrades(courseGrades);
    } else {
      const filtered = courseGrades.filter(grade => 
        grade.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGrades(filtered);
    }
  }, [searchQuery, courseGrades]);

  const handleCourseChange = async (event) => {
    const courseCode = event.target.value;
    setSelectedCourse(courseCode);
    setCourseGrades([]);
    setGradesError(null);

    if (courseCode) {
      try {
        setLoadingGrades(true);
        const response = await fetch(
          `${BASE_URL}/api/gpa/get-grades-for-course/${courseCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch grades");
        }

        const data = await response.json();
        // Handle array response directly
        setCourseGrades(Array.isArray(data) ? data : []);
      } catch (error) {
        setGradesError(error.message || "Failed to fetch grades");
        Swal.fire("Error", error.message || "Failed to fetch grades", "error");
      } finally {
        setLoadingGrades(false);
      }
    }
  };

  const handleOpenModal = () => {
    setGradeData({
      studentId: "",
      courseCode: selectedCourse,
      score: "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditGrade = (grade) => {
    setGradeData({
      studentId: grade.studentId,
      courseCode: grade.courseCode,
      score: grade.score.toString(),
    });
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDeleteGrade = async (studentId, courseCode) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(
          `${BASE_URL}/api/gpa/delete-grade/${studentId}/${courseCode}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete grade");
        }

        Swal.fire("Deleted!", "Grade has been deleted.", "success");
        // Refresh the grades list
        handleCourseChange({ target: { value: selectedCourse } });
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to delete grade", "error");
    }
  };

  const handleSubmitGrade = async () => {
    try {
      if (!gradeData.studentId || !gradeData.courseCode || !gradeData.score) {
        Swal.fire("Error", "Please fill in all fields", "error");
        return;
      }

      const score = parseFloat(gradeData.score);
      if (isNaN(score) || score < 0 || score > 100) {
        Swal.fire("Error", "Score must be between 0 and 100", "error");
        return;
      }

      const url = isEditing
        ? `${BASE_URL}/api/gpa/update-grade/${gradeData.studentId}/${gradeData.courseCode}`
        : `${BASE_URL}/api/gpa/add-grade/${gradeData.courseCode}`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          studentId: gradeData.studentId,
          courseCode: gradeData.courseCode,
          score: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add/update grade");
      }

      Swal.fire("Success", isEditing ? "Grade updated successfully" : "Grade added successfully", "success");
      handleCloseModal();
      setIsEditing(false);
      // Refresh grades after adding/updating grade
      handleCourseChange({ target: { value: selectedCourse } });
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to add/update grade", "error");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      Swal.fire("Error", "Please upload an Excel file (.xlsx or .xls)", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await fetch(`${BASE_URL}/api/gpa/upload-grades/${selectedCourse}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire("Success", "Grades uploaded successfully", "success");
        // Refresh grades after uploading
        handleCourseChange({ target: { value: selectedCourse } });
      } else {
        throw new Error(data.message || "Failed to upload grades");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to upload grades", "error");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Grades Management</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={handleCourseChange}
              label="Select Course"
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course.code}>
                  {course.code} - {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            disabled={!selectedCourse}
          >
            Add Grade
          </Button>
          <Button
            variant="contained"
            color="secondary"
            component="label"
            disabled={!selectedCourse || uploading}
          >
            {uploading ? "Uploading..." : "Upload Grades File"}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </Stack>
      </Box>

      {selectedCourse && (
        <>
          {/* Statistics Cards */}
          {stats && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '8px', color: '#FFD700' }} />
                      Top Performers
                    </Typography>
                    {stats.highestGrades.map((grade, index) => (
                      <Box key={grade._id} mb={1}>
                        <Typography variant="body2">
                          {index + 1}. {grade.studentId} - {grade.score} ({grade.grade})
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FontAwesomeIcon icon={faMedal} style={{ marginRight: '8px', color: '#C0C0C0' }} />
                      Course Statistics
                    </Typography>
                    <Typography variant="body2">Average Score: {stats.average}</Typography>
                    <Typography variant="body2">Passing Students: {stats.passingCount}</Typography>
                    <Typography variant="body2">Failing Students: {stats.failingCount}</Typography>
                    <Typography variant="body2">Total Students: {stats.totalStudents}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FontAwesomeIcon icon={faMedal} style={{ marginRight: '8px', color: '#CD7F32' }} />
                      Needs Improvement
                    </Typography>
                    {stats.lowestGrades.map((grade, index) => (
                      <Box key={grade._id} mb={1}>
                        <Typography variant="body2">
                          {index + 1}. {grade.studentId} - {grade.score} ({grade.grade})
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Search Bar */}
          <Box mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Grades Table */}
          <Typography variant="h6" mb={2}>
            Course Grades
          </Typography>
          {loadingGrades ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : gradesError ? (
            <Alert severity="error">{gradesError}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {searchQuery ? "No matching students found" : "No grades found for this course"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade._id}>
                        <TableCell>{grade.studentId}</TableCell>
                        <TableCell>{grade.studentName}</TableCell>
                        <TableCell>{grade.score}</TableCell>
                        <TableCell>
                          <Chip
                            label={grade.grade}
                            color={
                              grade.grade === "A"
                                ? "success"
                                : grade.grade === "B"
                                ? "primary"
                                : grade.grade === "C"
                                ? "info"
                                : grade.grade === "D"
                                ? "warning"
                                : "error"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{grade.term}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit Grade">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditGrade(grade)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Grade">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteGrade(grade.studentId, grade.courseCode)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{isEditing ? "Edit Grade" : "Add Grade"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Student ID"
              name="studentId"
              value={gradeData.studentId}
              onChange={handleGradeChange}
              fullWidth
              required
              disabled={isEditing}
            />
            <TextField
              label="Course Code"
              name="courseCode"
              value={gradeData.courseCode}
              disabled
              fullWidth
            />
            <TextField
              label="Score"
              name="score"
              type="number"
              value={gradeData.score}
              onChange={handleGradeChange}
              fullWidth
              required
              inputProps={{ min: 0, max: 100 }}
              helperText="Enter a score between 0 and 100"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleCloseModal();
            setIsEditing(false);
          }}>Cancel</Button>
          <Button onClick={handleSubmitGrade} variant="contained" color="primary">
            {isEditing ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Grades;
