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
import {
  faPenToSquare,
  faTrash,
  faSearch,
  faTrophy,
  faMedal,
} from "@fortawesome/free-solid-svg-icons";

function Grades() {
  const { courses, isLoading, error } = useDoctor();
  const { authToken } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [gradeData, setGradeData] = useState({
    studentId: "",
    courseCode: "",
    components: {
      midterm: {
        score: "",
        maxScore: 20
      },
      work: {
        score: "",
        maxScore: 30
      },
      final: {
        score: "",
        maxScore: 50
      }
    }
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

    const sortedGrades = [...courseGrades].sort((a, b) => b.totalScore - a.totalScore);
    const highestGrades = sortedGrades.slice(0, 3);
    const lowestGrades = sortedGrades.slice(-3).reverse();

    const average =
      courseGrades.reduce((acc, grade) => acc + grade.totalScore, 0) /
      courseGrades.length;
    const passingCount = courseGrades.filter(
      (grade) => grade.totalScore >= 60
    ).length;
    const failingCount = courseGrades.filter(
      (grade) => grade.totalScore < 60
    ).length;

    return {
      highestGrades,
      lowestGrades,
      average: average.toFixed(2),
      passingCount,
      failingCount,
      totalStudents: courseGrades.length,
    };
  };

  const stats = calculateStats();

  // Filter grades based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGrades(courseGrades);
    } else {
      const filtered = courseGrades.filter((grade) =>
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
        
        // Fetch midterm grades
        const midtermResponse = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/midterm`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // Fetch work grades
        const workResponse = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/work`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        // Fetch final grades
        const finalResponse = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/final`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!midtermResponse.ok || !workResponse.ok || !finalResponse.ok) {
          throw new Error("Failed to fetch grades");
        }

        const midtermData = await midtermResponse.json();
        const workData = await workResponse.json();
        const finalData = await finalResponse.json();

        // Process and combine the grades
        const combinedGrades = processGrades(midtermData.data, workData.data, finalData.data, courseCode);
        setCourseGrades(combinedGrades);
      } catch (error) {
        setGradesError(error.message || "Failed to fetch grades");
        Swal.fire("Error", error.message || "Failed to fetch grades", "error");
      } finally {
        setLoadingGrades(false);
      }
    }
  };

  const processGrades = (midtermGrades, workGrades, finalGrades, courseCode) => {
    const combinedGrades = {};
    
    // Process midterm grades
    midtermGrades.forEach(grade => {
      if (!combinedGrades[grade.studentId]) {
        combinedGrades[grade.studentId] = {
          studentId: grade.studentId,
          courseCode: courseCode,
          components: {
            midterm: { score: grade.score, maxScore: grade.maxScore },
            work: { score: 0, maxScore: 30 },
            final: { score: 0, maxScore: 50 }
          }
        };
      } else {
        combinedGrades[grade.studentId].components.midterm = {
          score: grade.score,
          maxScore: grade.maxScore
        };
      }
    });

    // Process work grades
    workGrades.forEach(grade => {
      if (!combinedGrades[grade.studentId]) {
        combinedGrades[grade.studentId] = {
          studentId: grade.studentId,
          courseCode: courseCode,
          components: {
            midterm: { score: 0, maxScore: 20 },
            work: { score: grade.score, maxScore: grade.maxScore },
            final: { score: 0, maxScore: 50 }
          }
        };
      } else {
        combinedGrades[grade.studentId].components.work = {
          score: grade.score,
          maxScore: grade.maxScore
        };
      }
    });

    // Process final grades
    finalGrades.forEach(grade => {
      if (!combinedGrades[grade.studentId]) {
        combinedGrades[grade.studentId] = {
          studentId: grade.studentId,
          courseCode: courseCode,
          components: {
            midterm: { score: 0, maxScore: 20 },
            work: { score: 0, maxScore: 30 },
            final: { score: grade.score, maxScore: grade.maxScore }
          }
        };
      } else {
        combinedGrades[grade.studentId].components.final = {
          score: grade.score,
          maxScore: grade.maxScore
        };
      }
    });

    // Calculate total scores and grades
    return Object.values(combinedGrades).map(grade => {
      const totalScore = 
        (grade.components.midterm.score / grade.components.midterm.maxScore * 20) +
        (grade.components.work.score / grade.components.work.maxScore * 30) +
        (grade.components.final.score / grade.components.final.maxScore * 50);

      let gradeLetter = 'F';
      if (totalScore >= 90) gradeLetter = 'A';
      else if (totalScore >= 80) gradeLetter = 'B';
      else if (totalScore >= 70) gradeLetter = 'C';
      else if (totalScore >= 60) gradeLetter = 'D';

      return {
        ...grade,
        totalScore: Math.round(totalScore * 100) / 100,
        grade: gradeLetter
      };
    });
  };

  const handleOpenModal = () => {
    setGradeData({
      studentId: "",
      courseCode: selectedCourse,
      components: {
        midterm: {
          score: "",
          maxScore: 20
        },
        work: {
          score: "",
          maxScore: 30
        },
        final: {
          score: "",
          maxScore: 50
        }
      }
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    const [component, field] = name.split('.');
    
    setGradeData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          [field]: value
        }
      }
    }));
  };

  const handleEditGrade = (grade) => {
    setGradeData({
      studentId: grade.studentId,
      courseCode: grade.courseCode,
      components: {
        midterm: {
          score: grade.components.midterm.score.toString(),
          maxScore: grade.components.midterm.maxScore
        },
        work: {
          score: grade.components.work.score.toString(),
          maxScore: grade.components.work.maxScore
        },
        final: {
          score: grade.components.final.score.toString(),
          maxScore: grade.components.final.maxScore
        }
      }
    });
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDeleteGrade = async (studentId, courseCode) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/${studentId}/midterm`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete midterm grade");
        }

        const workResponse = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/${studentId}/work`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!workResponse.ok) {
          throw new Error("Failed to delete work grade");
        }

        const finalResponse = await fetch(
          `${BASE_URL}/api/gpa/${courseCode}/${studentId}/final`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!finalResponse.ok) {
          throw new Error("Failed to delete final grade");
        }

        Swal.fire("Deleted!", "Grades have been deleted.", "success");
        // Refresh the grades list
        handleCourseChange({ target: { value: selectedCourse } });
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to delete grades", "error");
    }
  };

  const handleSubmitGrade = async () => {
    try {
      if (!gradeData.studentId || !gradeData.courseCode) {
        Swal.fire("Error", "Please fill in all required fields", "error");
        return;
      }

      // Validate component scores
      const components = gradeData.components;
      for (const [component, data] of Object.entries(components)) {
        const score = parseFloat(data.score);
        if (isNaN(score) || score < 0 || score > data.maxScore) {
          Swal.fire("Error", `${component} score must be between 0 and ${data.maxScore}`, "error");
          return;
        }
      }

      // Submit each component grade separately
      const submitPromises = [];

      // Submit midterm grade
      if (gradeData.components.midterm.score) {
        submitPromises.push(
          fetch(`${BASE_URL}/api/gpa/${gradeData.courseCode}/${gradeData.studentId}/midterm`, {
            method: isEditing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              score: parseFloat(gradeData.components.midterm.score),
              maxScore: gradeData.components.midterm.maxScore
            }),
          })
        );
      }

      // Submit work grade
      if (gradeData.components.work.score) {
        submitPromises.push(
          fetch(`${BASE_URL}/api/gpa/${gradeData.courseCode}/${gradeData.sectionId}/${gradeData.studentId}/work`, {
            method: isEditing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              score: parseFloat(gradeData.components.work.score),
              maxScore: gradeData.components.work.maxScore
            }),
          })
        );
      }

      // Submit final grade
      if (gradeData.components.final.score) {
        submitPromises.push(
          fetch(`${BASE_URL}/api/gpa/${gradeData.courseCode}/${gradeData.studentId}/final`, {
            method: isEditing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              score: parseFloat(gradeData.components.final.score),
              maxScore: gradeData.components.final.maxScore
            }),
          })
        );
      }

      const responses = await Promise.all(submitPromises);
      const hasError = responses.some(response => !response.ok);

      if (hasError) {
        throw new Error("Failed to add/update one or more grades");
      }

      Swal.fire(
        "Success",
        isEditing ? "Grades updated successfully" : "Grades added successfully",
        "success"
      );
      handleCloseModal();
      setIsEditing(false);
      // Refresh grades after adding/updating grade
      handleCourseChange({ target: { value: selectedCourse } });
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to add/update grades", "error");
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
    formData.append("gradesFile", file);

    try {
      setUploading(true);
      const response = await fetch(
        `${BASE_URL}/api/gpa/upload-grades/${selectedCourse}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        // Create a detailed message with the results
        let message = `<div style="text-align: left;">
          <h4>Upload Summary</h4>
          <p><strong>Total Records:</strong> ${data.results.total}</p>
          <p><strong>Successful:</strong> ${data.results.success}</p>
          <p><strong>Failed:</strong> ${data.results.failures}</p>`;

        if (data.results.errors && data.results.errors.length > 0) {
          message += `<h4>Errors:</h4><ul>`;
          data.results.errors.forEach(error => {
            message += `<li>Row ${error.row}:${error.error}</li>`;
          });
          message += `</ul>`;
        }


        Swal.fire({
          title: data.success ? "Upload Complete" : "Upload Issues",
          html: message,
          icon: data.results.failures === 0 ? "success" : "warning",
          width: '600px'
        });

        // Refresh the grades list
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
                      <FontAwesomeIcon
                        icon={faTrophy}
                        style={{ marginRight: "8px", color: "#FFD700" }}
                      />
                      Top Performers
                    </Typography>
                    {stats.highestGrades.map((grade, index) => (
                      <Box key={grade._id} mb={1}>
                        <Typography variant="body2">
                          {index + 1}. {grade.studentId} - {grade.totalScore} (
                          {grade.grade})
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
                      <FontAwesomeIcon
                        icon={faMedal}
                        style={{ marginRight: "8px", color: "#C0C0C0" }}
                      />
                      Course Statistics
                    </Typography>
                    <Typography variant="body2">
                      Average Score: {stats.average}
                    </Typography>
                    <Typography variant="body2">
                      Passing Students: {stats.passingCount}
                    </Typography>
                    <Typography variant="body2">
                      Failing Students: {stats.failingCount}
                    </Typography>
                    <Typography variant="body2">
                      Total Students: {stats.totalStudents}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <FontAwesomeIcon
                        icon={faMedal}
                        style={{ marginRight: "8px", color: "#CD7F32" }}
                      />
                      Needs Improvement
                    </Typography>
                    {stats.lowestGrades.map((grade, index) => (
                      <Box key={grade._id} mb={1}>
                        <Typography variant="body2">
                          {index + 1}. {grade.studentId} - {grade.totalScore} (
                          {grade.grade})
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Midterm</TableCell>
                  <TableCell>Work</TableCell>
                  <TableCell>Final</TableCell>
                  <TableCell>Total Score</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingGrades ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : gradesError ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Alert severity="error">{gradesError}</Alert>
                    </TableCell>
                  </TableRow>
                ) : filteredGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No grades found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrades.map((grade) => (
                    <TableRow key={`${grade.studentId}-${grade.courseCode}`}>
                      <TableCell>{grade.studentId}</TableCell>
                      <TableCell>{grade.courseCode}</TableCell>
                      <TableCell>{grade.courseName}</TableCell>
                      <TableCell>
                        {grade.components.midterm.score}/{grade.components.midterm.maxScore}
                      </TableCell>
                      <TableCell>
                        {grade.components.work.score}/{grade.components.work.maxScore}
                      </TableCell>
                      <TableCell>
                        {grade.components.final.score}/{grade.components.final.maxScore}
                      </TableCell>
                      <TableCell>{grade.totalScore}</TableCell>
                      <TableCell>{grade.grade}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit Grade">
                            <IconButton
                              size="small"
                              onClick={() => handleEditGrade(grade)}
                              color="primary"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Grade">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteGrade(grade.studentId, grade.courseCode)}
                              color="error"
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
        </>
      )}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Grade" : "Add New Grade"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  name="studentId"
                  value={gradeData.studentId}
                  onChange={(e) => setGradeData(prev => ({ ...prev, studentId: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  name="courseCode"
                  value={gradeData.courseCode}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Component Scores</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Midterm Score"
                  name="midterm.score"
                  type="number"
                  value={gradeData.components.midterm.score}
                  onChange={handleGradeChange}
                  required
                  inputProps={{ min: 0, max: gradeData.components.midterm.maxScore }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">/ {gradeData.components.midterm.maxScore}</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Work Score"
                  name="work.score"
                  type="number"
                  value={gradeData.components.work.score}
                  onChange={handleGradeChange}
                  required
                  inputProps={{ min: 0, max: gradeData.components.work.maxScore }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">/ {gradeData.components.work.maxScore}</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Final Score"
                  name="final.score"
                  type="number"
                  value={gradeData.components.final.score}
                  onChange={handleGradeChange}
                  required
                  inputProps={{ min: 0, max: gradeData.components.final.maxScore }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">/ {gradeData.components.final.maxScore}</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmitGrade} variant="contained" color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Grades;
