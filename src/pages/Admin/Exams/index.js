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
} from "@mui/material";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

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
export default function Exams() {
  const { authToken } = useAuth();
  const [examsData, setExamsData] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleAddExam = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Exam",
      html: `
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam ID</label>
          <input id="examId" class="swal2-input" placeholder="Enter Exam ID">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Course Code</label>
          <input id="courseCode" class="swal2-input" placeholder="Enter Course Code">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Course Name</label>
          <input id="courseName" class="swal2-input" placeholder="Enter Course Name">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam Date</label>
          <input id="examDate" min=${today} type="date" class="swal2-input">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Start Time</label>
          <input id="startTime" class="swal2-input" placeholder="e.g. 09:00 AM">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">End Time</label>
          <input id="endTime" class="swal2-input" placeholder="e.g. 11:00 AM">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Rooms (comma-separated)</label>
          <input id="roomNumbers" class="swal2-input" placeholder="e.g. Room 101, Room 102">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Semester</label>
          <input id="semester" class="swal2-input" placeholder="Enter Semester">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam Type</label>
          <select id="examType" class="swal2-input">
            ${examTypes
              .map((type) => `<option value="${type}">${type}</option>`)
              .join("")}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Academic Level</label>
          <select id="academicLevel" class="swal2-input">
            ${academicLevels
              .map((level) => `<option value="${level}">${level}</option>`)
              .join("")}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Department</label>
          <select id="department" class="swal2-input">
            ${departments
              .map((dept) => `<option value="${dept}">${dept}</option>`)
              .join("")}
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Exam",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const data = {
          examId: document.getElementById("examId").value,
          courseCode: document.getElementById("courseCode").value,
          courseName: document.getElementById("courseName").value,
          examDate: document.getElementById("examDate").value,
          startTime: document.getElementById("startTime").value,
          endTime: document.getElementById("endTime").value,
          roomNumbers: document
            .getElementById("roomNumbers")
            .value.split(",")
            .map((r) => r.trim()),
          roomCapacity: 100,
          semester: document.getElementById("semester").value,
          examType: document.getElementById("examType").value,
          academicLevel: document.getElementById("academicLevel").value,
          department: document.getElementById("department").value,
        };

        try {
          validateExamData(data);
          return data;
        } catch (error) {
          Swal.showValidationMessage(error.message);
          return false;
        }
      },
    });

    if (formValues) {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/admin/add-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formValues),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to add exam");
        }

        Swal.fire("Success", "Exam added successfully", "success");
        fetchExams();
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditExam = async (exam) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Exam",
      html: `
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam ID</label>
          <input id="examId" class="swal2-input" value="${
            exam.examId
          }" readonly>
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Course Code</label>
          <input id="courseCode" class="swal2-input" value="${exam.courseCode}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Course Name</label>
          <input id="courseName" class="swal2-input" value="${exam.courseName}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam Date</label>
          <input id="examDate" type="date" class="swal2-input" value="${
            exam.examDate
          }">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Start Time</label>
          <input id="startTime" class="swal2-input" value="${exam.startTime}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">End Time</label>
          <input id="endTime" class="swal2-input" value="${exam.endTime}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Rooms (comma-separated)</label>
          <input id="roomNumbers" class="swal2-input" value="${exam.roomNumbers.join(
            ", "
          )}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Semester</label>
          <input id="semester" class="swal2-input" value="${exam.semester}">
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Exam Type</label>
          <select id="examType" class="swal2-input">
            ${examTypes
              .map(
                (type) =>
                  `<option value="${type}" ${
                    type === exam.examType ? "selected" : ""
                  }>${type}</option>`
              )
              .join("")}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Academic Level</label>
          <select id="academicLevel" class="swal2-input">
            ${academicLevels
              .map(
                (level) =>
                  `<option value="${level}" ${
                    level === exam.academicLevel ? "selected" : ""
                  }>${level}</option>`
              )
              .join("")}
          </select>
        </div>
        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">Department</label>
          <select id="department" class="swal2-input">
            ${departments
              .map(
                (dept) =>
                  `<option value="${dept}" ${
                    dept === exam.department ? "selected" : ""
                  }>${dept}</option>`
              )
              .join("")}
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Exam",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const data = {
          examId: document.getElementById("examId").value,
          courseCode: document.getElementById("courseCode").value,
          courseName: document.getElementById("courseName").value,
          examDate: document.getElementById("examDate").value,
          startTime: document.getElementById("startTime").value,
          endTime: document.getElementById("endTime").value,
          roomNumbers: document
            .getElementById("roomNumbers")
            .value.split(",")
            .map((r) => r.trim()),
          roomCapacity: 100,
          semester: document.getElementById("semester").value,
          examType: document.getElementById("examType").value,
          academicLevel: document.getElementById("academicLevel").value,
          department: document.getElementById("department").value,
        };

        try {
          validateExamData(data);
          return data;
        } catch (error) {
          Swal.showValidationMessage(error.message);
          return false;
        }
      },
    });

    if (formValues) {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/admin/update-exam/${exam.examId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formValues),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update exam");
        }

        Swal.fire("Success", "Exam updated successfully", "success");
        fetchExams();
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
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
          onClick={handleAddExam}
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

      <Stack spacing={4}>
        {departments.map((dept) => (
          <Card
            key={dept}
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
                {dept}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {examsData[dept]?.length > 0 ? (
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
                      {examsData[dept].map((exam) => (
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
                                sx={{ mr: 0.5 }}
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
                                  onClick={() => handleEditExam(exam)}
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
                  No exams scheduled for this department.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
