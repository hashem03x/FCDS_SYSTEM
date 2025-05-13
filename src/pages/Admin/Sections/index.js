import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPen } from "@fortawesome/free-solid-svg-icons";

const initialFormState = {
  sectionId: "",
  taId: "",
  capacity: "",
  sessions: [
    { day: "", startTime: "", endTime: "", room: "", type: "Section" },
  ],
};

function Sections() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    sectionId: "",
    taId: "",
    capacity: "",
    sessions: [
      { day: "", startTime: "", endTime: "", room: "", type: "Section" },
    ],
  });
  const [selectedCourseCode, setSelectedCourseCode] = useState(null);
  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    const courseMatches =
      course.name?.toLowerCase().includes(search) ||
      course.code?.toLowerCase().includes(search);

    const sectionMatches = course.sections?.some((section) =>
      section.taId?.toLowerCase().includes(search)
    );

    return courseMatches || sectionMatches;
  });

  const { authToken } = useAuth();
  console.log("Auth Token:", authToken);
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This course will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${BASE_URL}/api/admin/delete-course/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        await fetchCourses();
        Swal.fire("Deleted!", "Course has been deleted.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleOpenForm = (course = null) => {
    setEditingCourse(course);
    setFormData(course ? { ...course } : { ...initialFormState });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({ ...initialFormState });
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/add-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire("Success!", "Course added successfully.", "success");
        resetForm();
        setOpen(false);
        await fetchCourses();
      } else {
        const data = await response.json();
        Swal.fire("Error!", `Failed to add course: ${data.message}`, "error");
        resetForm();
        setOpen(false);
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An unexpected error occurred. Please try again.",
        "error"
      );
      resetForm();
      setOpen(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/update-course/${editingCourse?.code}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Swal.fire("Success!", "Course updated successfully.", "success");
        resetForm();
        setOpen(false);
        await fetchCourses();
      } else {
        const data = await response.json();
        Swal.fire(
          "Error!",
          `Failed to update course: ${data.message}`,
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An unexpected error occurred. Please try again.",
        "error"
      );
    }
  };

  const handleAddSection = async () => {
    if (!selectedCourseCode) return;

    const endpoint = isEditingSection
      ? `${BASE_URL}/api/admin/update-section/${selectedCourseCode}/${selectedSectionId}`
      : `${BASE_URL}/api/admin/add-section/${selectedCourseCode}`;

    const method = isEditingSection ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(sectionFormData),
      });

      if (res.ok) {
        Swal.fire(
          "Success",
          isEditingSection
            ? "Section updated successfully"
            : "Section added successfully",
          "success"
        );
        setSectionDialogOpen(false);
        setIsEditingSection(false);
        setSelectedSectionId(null);
        setSectionFormData({
          sectionId: "",
          taId: "",
          capacity: "",
          sessions: [
            { day: "", startTime: "", endTime: "", room: "", type: "Section" },
          ],
        });
        await fetchCourses();
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "Failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleDeleteSection = async (courseCode, sectionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Section ${sectionId} will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/delete-section/${courseCode}/${sectionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (res.ok) {
          Swal.fire("Deleted!", "Section has been deleted.", "success");
          await fetchCourses();
        } else {
          const data = await res.json();
          Swal.fire(
            "Error",
            data.message || "Failed to delete section",
            "error"
          );
        }
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Sections Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => handleOpenForm()}
        sx={{ mb: 2 }}
      >
        Add Section
      </Button>
      <TextField
        label="Search by Name or ID"
        variant="outlined"
        size="small"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TableContainer sx={{ overflowX: "scroll" }} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Credit Hours</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Semester</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course, index) => (
              <React.Fragment key={course._id}>
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.creditHours}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>

                {/* Section Rows */}
                {course.sections?.map((section) => (
                  <TableRow
                    key={section.sectionId}
                    sx={{ backgroundColor: "#f5f5f5" }}
                  >
                    <TableCell colSpan={7}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #ddd",
                          backgroundColor: "#fff",
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Section: {section.sectionId}
                          </Typography>
                          <Box>
                            <IconButton
                              sx={{ alignSelf: "flex-start" }}
                              onClick={() => {
                                setSelectedCourseCode(course.code);
                                setSelectedSectionId(section.sectionId);
                                setIsEditingSection(true);
                                setSectionFormData({
                                  sectionId: section.sectionId,
                                  taId: section.taId,
                                  capacity: section.capacity,
                                  sessions: section.sessions?.[0] || {
                                    startTime: "",
                                    endTime: "",
                                    room: "",
                                    type: "Section",
                                  },
                                });
                                setSectionDialogOpen(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faUserPen} />
                            </IconButton>
                            <IconButton
                              sx={{ alignSelf: "flex-start", ml: 1 }}
                              onClick={() =>
                                handleDeleteSection(
                                  course.code,
                                  section.sectionId
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>TA:</strong> {section.taId} |{" "}
                          <strong>Capacity:</strong> {section.capacity} |{" "}
                          <strong>Full:</strong> {section.isFull ? "Yes" : "No"}
                        </Typography>

                        {section.sessions?.map((session) => (
                          <Box
                            key={session._id}
                            sx={{
                              mt: 1,
                              p: 1,
                              backgroundColor: "#f0f0f0",
                              borderRadius: 1,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 2,
                              fontSize: "0.9rem",
                            }}
                          >
                            <div>
                              <strong>Day:</strong> {session?.day}
                            </div>
                            <div>
                              <strong>Time:</strong> {session.startTime} -{" "}
                              {session?.endTime}
                            </div>
                            <div>
                              <strong>Room:</strong> {session?.room}
                            </div>
                            <div>
                              <strong>Type:</strong> {session?.type}
                            </div>
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {isEditingSection
            ? "Add Section"
            : `Edit Section to ${selectedCourseCode}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Course Name"
            fullWidth
            margin="dense"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            label="Code"
            fullWidth
            margin="dense"
            name="code"
            value={formData.code}
            onChange={handleChange}
          />
          <TextField
            label="Credit Hours"
            fullWidth
            margin="dense"
            type="number"
            name="creditHours"
            value={formData.creditHours}
            onChange={handleChange}
          />
          <TextField
            label="Department"
            fullWidth
            margin="dense"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
          <TextField
            label="Doctor ID"
            fullWidth
            margin="dense"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
          />
          <TextField
            label="Capacity"
            fullWidth
            margin="dense"
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          />
          <TextField
            label="Semester"
            fullWidth
            margin="dense"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
          />
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            name="startDate"
            value={formData.startDate?.split("T")[0] || ""}
            onChange={handleChange}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            name="endDate"
            value={formData.endDate?.split("T")[0] || ""}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSection}>
            {isEditingSection ? "Update Section" : "Add Section"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
      >
        <DialogTitle>Add Section to {selectedCourseCode}</DialogTitle>
        <DialogContent>
          <TextField
            label="Section ID"
            fullWidth
            margin="dense"
            value={sectionFormData.sectionId}
            onChange={(e) =>
              setSectionFormData({
                ...sectionFormData,
                sectionId: e.target.value,
              })
            }
          />
          <TextField
            label="TA ID"
            fullWidth
            margin="dense"
            value={sectionFormData.taId}
            onChange={(e) =>
              setSectionFormData({ ...sectionFormData, taId: e.target.value })
            }
          />
          <TextField
            label="Capacity"
            type="number"
            fullWidth
            margin="dense"
            value={sectionFormData.capacity}
            onChange={(e) =>
              setSectionFormData({
                ...sectionFormData,
                capacity: e.target.value,
              })
            }
          />
          <TextField
            label="Day"
            fullWidth
            margin="dense"
            value={sectionFormData.sessions[0]?.day}
            onChange={(e) =>
              setSectionFormData((prev) => ({
                ...prev,
                sessions: [{ ...prev.sessions[0], day: e.target.value }],
              }))
            }
          />
          <TextField
            label="Start Time"
            fullWidth
            margin="dense"
            value={sectionFormData.sessions[0]?.startTime}
            onChange={(e) =>
              setSectionFormData((prev) => ({
                ...prev,
                sessions: [{ ...prev.sessions[0], startTime: e.target.value }],
              }))
            }
          />
          <TextField
            label="End Time"
            fullWidth
            margin="dense"
            value={sectionFormData.sessions[0]?.endTime}
            onChange={(e) =>
              setSectionFormData((prev) => ({
                ...prev,
                sessions: [{ ...prev.sessions[0], endTime: e.target.value }],
              }))
            }
          />
          <TextField
            label="Room"
            fullWidth
            margin="dense"
            value={sectionFormData.sessions[0]?.room}
            onChange={(e) =>
              setSectionFormData((prev) => ({
                ...prev,
                sessions: [{ ...prev.sessions[0], room: e.target.value }],
              }))
            }
          />
          <TextField
            label="Type"
            fullWidth
            margin="dense"
            value={sectionFormData.sessions[0]?.type}
            onChange={(e) =>
              setSectionFormData((prev) => ({
                ...prev,
                sessions: [{ ...prev.sessions[0], type: e.target.value }],
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSection}>Add Section</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sections;
