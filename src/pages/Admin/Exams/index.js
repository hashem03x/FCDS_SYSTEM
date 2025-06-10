import React, { useState, useEffect } from "react";
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
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { useAdmin } from "../../../context/AdminContext";

const departments = [
  "Computing and Data Science",
  "Business",
  "Information Systems",
  "Cyber Security",
  "Artificial Intelligence",
];

const academicLevels = ["First", "Second", "Third", "Fourth"];
const examTypes = ["Final", "Midterm", "Quiz", "Assignment"];
const today = new Date().toISOString().split("T")[0];

const initialFormState = {
  examId: "",
  courseCode: "",
  courseName: "",
  examDate: "",
  startTime: "",
  endTime: "",
  roomNumbers: [],
  roomCapacity: 100,
  semester: "",
  examType: "",
  academicLevel: "",
  department: "",
};

export default function Exams() {
  const { authToken } = useAuth();
  const { courses, loading: coursesLoading } = useAdmin();
  const [examsData, setExamsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/exams`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      // Organize by department
      const organized = departments.reduce((acc, dept) => {
        acc[dept] = data.filter((e) => e.department === dept);
        return acc;
      }, {});

      setExamsData(organized);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const validateExamData = (data) => {
    const required = [
      "examId",
      "courseCode",
      "courseName",
      "examDate",
      "startTime",
      "endTime",
      "roomNumbers",
      "semester",
      "examType",
      "academicLevel",
      "department",
    ];
    const missing = required.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      throw new Error("Invalid time format. Please use format: HH:MM AM/PM");
    }

    // Validate date
    if (new Date(data.examDate) < new Date()) {
      throw new Error("Exam date cannot be in the past");
    }
  };

  const handleOpenForm = (exam = null) => {
    setEditingExam(exam);
    setFormData(exam || { ...initialFormState });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingExam(null);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If course code changes, update course name
    if (name === "courseCode") {
      const selectedCourse = courses.find((c) => c.code === value);
      if (selectedCourse) {
        setFormData((prev) => ({
          ...prev,
          courseName: selectedCourse.name,
          department: selectedCourse.department,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      validateExamData(formData);
      setLoading(true);

      const url = editingExam
        ? `${BASE_URL}/api/admin/update-exam/${editingExam.examId}`
        : `${BASE_URL}/api/admin/add-exam`;
      const method = editingExam ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save exam");
      }

      Swal.fire(
        "Success",
        `Exam ${editingExam ? "updated" : "added"} successfully`,
        "success"
      );
      handleClose();
      fetchExams();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Delete exam "${examId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/admin/delete-exam/${examId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error("Failed to delete");
        Swal.fire("Deleted!", "Exam has been deleted.", "success");
        fetchExams();
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleYearChange = (event, newValue) => {
    setSelectedYear(newValue);
  };

  const filteredExams = selectedDepartment ? examsData[selectedDepartment] : [];
  console.log("Exams Data", examsData[selectedDepartment]);
  return (
    <Box p={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h5"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FontAwesomeIcon icon={faClipboardList} />
          Manage Exams
        </Typography>
        <Button
          onClick={() => handleOpenForm()}
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          disabled={loading}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: 4,
            },
            transition: "all 0.2s",
          }}
        >
          Add New Exam
        </Button>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {!selectedDepartment ? (
        <Box>
          <Typography variant="h6" gutterBottom mb={3}>
            Select Department
          </Typography>
          <Grid container spacing={3}>
            {console.log(departments)}
            {console.log(examsData)}
            {departments.map((dept) => (
              <Grid item xs={12} sm={6} md={4} key={dept}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                    border: selectedDepartment === dept ? "2px solid" : "none",
                    borderColor: "primary.main",
                  }}
                  onClick={() => setSelectedDepartment(dept)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {dept}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {examsData[dept]?.length || 0} exams scheduled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setSelectedDepartment("")}
              startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
              sx={{ mb: 2 }}
            >
              Back to Departments
            </Button>
            <Typography variant="h5" gutterBottom>
              {selectedDepartment}
            </Typography>
          </Box>


          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              "&:hover": {
                boxShadow: 4,
              },
              transition: "all 0.2s",
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold" mb={2} color="primary">
                {selectedDepartment}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {filteredExams.length > 0 ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.light" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Course Code
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Course
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Rooms</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExams.map((exam) => (
                        <TableRow
                          key={exam.examId}
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <TableCell>{exam.examId}</TableCell>
                          <TableCell>{exam.courseCode}</TableCell>
                          <TableCell>{exam.courseName}</TableCell>
                          <TableCell>{exam.examDate}</TableCell>
                          <TableCell>
                            {exam.startTime} - {exam.endTime}
                          </TableCell>
                          <TableCell>
                            {exam.roomNumbers.map((room, index) => (
                              <Chip
                                key={index}
                                label={room}
                                size="small"
                                
                                sx={{ mr: 0.5 , mb: 0.8 }}
                              />
                            ))}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={exam.examType}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit Exam">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenForm(exam)}
                                  color="primary"
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Exam">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(exam.examId)}
                                  color="error"
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ py: 2, textAlign: "center" }}
                >
                  No exams scheduled for {academicLevels[selectedYear]} year in{" "}
                  {selectedDepartment}.
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingExam ? "Edit Exam" : "Add New Exam"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Exam ID"
                fullWidth
                name="examId"
                value={formData.examId}
                onChange={handleChange}
                disabled={!!editingExam}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Course"
                fullWidth
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                disabled={!!editingExam}
              >
                <MenuItem value="">
                  <em>Select a course</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Course Name"
                fullWidth
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                fullWidth
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Exam Date"
                type="date"
                fullWidth
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                fullWidth
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="e.g. 09:00 AM"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                fullWidth
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="e.g. 11:00 AM"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rooms (comma-separated)"
                fullWidth
                name="roomNumbers"
                value={formData.roomNumbers.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    roomNumbers: e.target.value.split(",").map((r) => r.trim()),
                  }))
                }
                placeholder="e.g. Room 101, Room 102"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Semester"
                fullWidth
                name="semester"
                value={formData.semester}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Exam Type"
                fullWidth
                name="examType"
                value={formData.examType}
                onChange={handleChange}
              >
                {examTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Academic Level"
                fullWidth
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
              >
                {academicLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingExam ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
