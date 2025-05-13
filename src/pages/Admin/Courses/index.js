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
  Skeleton,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext"; // adjust path if needed
import { BASE_URL } from "../../../utils/api"; // make sure it's defined properly
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPen } from "@fortawesome/free-solid-svg-icons";
const initialFormState = {
  name: "",
  code: "",
  creditHours: "",
  department: "",
  doctorId: "",
  capacity: "",
  semester: "",
  startDate: "",
  endDate: "",
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");

  const { authToken } = useAuth();

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
    console.log(course);
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
      const response = await fetch(
        `${BASE_URL}/api/admin/add-course`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, 
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Course added successfully.",
          icon: "success",
          position: "center", 
        });
        resetForm(); // Reset form after success
        setOpen(false); // Close the dialog
        await fetchCourses(); // Refresh the course list
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to add course: ${data.message}`,
          icon: "error",
          position: "top-center", 
        });
        resetForm(); // Reset form after success
        setOpen(false); // Close the dialog
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        position: "top-center", // Ensure SweetAlert appears at the top of the screen
      });
      resetForm(); // Reset form after success
      setOpen(false); // Close the dialog
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    console.log("Updating course with ID:", editingCourse);
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
        Swal.fire({
          title: "Success!",
          text: "Course updated successfully.",
          icon: "success",
          position: "center",
        });
        resetForm();
        setOpen(false);
        await fetchCourses();
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to update course: ${data.message}`,
          icon: "error",
          position: "top-center",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        position: "top-center",
      });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Courses Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => handleOpenForm()}
        sx={{ mb: 2 }}
      >
        Add Course
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course, index) => (
              <TableRow key={course._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.creditHours}</TableCell>
                <TableCell>{course.department}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenForm(course)}>
                    <FontAwesomeIcon icon={faUserPen} />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(course._id)}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
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
            value={formData.startDate.split("T")[0] || ""}
            onChange={handleChange}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            name="endDate"
            value={formData.endDate.split("T")[0] || ""}
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={editingCourse ? handleUpdateCourse : handleAddCourse}>
            {editingCourse ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Courses;
