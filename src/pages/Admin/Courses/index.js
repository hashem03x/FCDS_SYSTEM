import React, { useState } from "react";
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
  MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { useAdmin } from "../../../context/AdminContext";
import { BASE_URL } from "../../../utils/api";
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
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");

  const { authToken } = useAuth();
  const { courses, doctors, loading, refreshCourses } = useAdmin();

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
        await refreshCourses();
        Swal.fire("Deleted!", "Course has been deleted.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error!", "Failed to delete course.", "error");
      }
    }
  };

  const handleOpenForm = (course = null) => {
    setEditingCourse(course);
    setFormData(course || { ...initialFormState });
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
        Swal.fire({
          title: "Success!",
          text: "Course added successfully.",
          icon: "success",
          position: "center",
        });
        resetForm();
        setOpen(false);
        await refreshCourses();
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to add course: ${data.message}`,
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

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/update-course/${editingCourse._id}`,
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
        await refreshCourses();
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

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        label="Search by Name or Code"
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
              <TableCell>Doctor</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell align="right"><Skeleton width="80px" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredCourses.map((course, index) => (
                <TableRow key={course._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.creditHours}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell>
                    {doctors.find(d => d.id === course.doctorId)?.name || "-"}
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
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
            type="number"
            fullWidth
            margin="dense"
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
            select
            label="Doctor"
            fullWidth
            margin="dense"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Capacity"
            type="number"
            fullWidth
            margin="dense"
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
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="dense"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
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
