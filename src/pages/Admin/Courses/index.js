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
  Grid,
  Stack,
  Tooltip,
  Chip,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { useAdmin } from "../../../context/AdminContext";
import { BASE_URL } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faFilePen } from "@fortawesome/free-solid-svg-icons";

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
  prerequisites: [],
  lectureSessions: [
    {
      day: "",
      startTime: "",
      endTime: "",
      room: "",
      type: "Lecture"
    }
  ]
};

function Courses() {
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  const { authToken } = useAuth();
  const { courses, doctors, loading, refreshCourses } = useAdmin();

  const availablePrerequisites = courses.filter(
    course => !editingCourse || course._id !== editingCourse._id
  );

  const handlePrerequisiteChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedPrerequisites(
      typeof value === 'string' ? value.split(',') : value,
    );
    setFormData(prev => ({
      ...prev,
      prerequisites: value
    }));
  };

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
        `${BASE_URL}/api/admin/update-course/${editingCourse.code}`,
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
              <TableCell>prerequisites</TableCell>
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
                  {console.log(course.prerequisites)}
                  <TableCell>{course.prerequisites.map(prerequisite => prerequisite).join(', ')}</TableCell>
                  <TableCell>
                    {doctors.find(d => d.id === course.doctorId)?.name || "-"}
                  </TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit Course">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(course)}
                          color="primary"
                        >
                          <FontAwesomeIcon icon={faFilePen} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(course._id)}
                          color="error"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? "Edit Course" : "Add New Course"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Hours"
                  name="creditHours"
                  type="number"
                  value={formData.creditHours}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 6 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  {[
                    "Administration",
                    "Computing and Data Science",
                    "Intelligent Systems",
                    "Cybersecurity",
                    "Business Analytics",
                    "Media Analytics",
                    "Healthcare Informatics and Data Analytics"
                  ].map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Doctor"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                >

                  {console.log(doctors)}
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {["Fall", "Summer", "Spring"].map((semester) => (
                    <MenuItem key={semester} value={semester}>
                      {semester}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Prerequisites"
                  name="prerequisites"
                  value={selectedPrerequisites}
                  onChange={handlePrerequisiteChange}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const course = availablePrerequisites.find(c => c._id === value);
                          return (
                            <Chip
                              key={value}
                              label={`${course?.code} - ${course?.name}`}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    ),
                  }}
                >
                  {availablePrerequisites.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Lecture Sessions</Typography>
                {formData.lectureSessions.map((session, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        select
                        label="Day"
                        name={`lectureSessions[${index}].day`}
                        value={session.day}
                        onChange={(e) => {
                          const newSessions = [...formData.lectureSessions];
                          newSessions[index].day = e.target.value;
                          setFormData(prev => ({ ...prev, lectureSessions: newSessions }));
                        }}
                        required
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        name={`lectureSessions[${index}].startTime`}
                        type="time"
                        value={session.startTime}
                        onChange={(e) => {
                          const newSessions = [...formData.lectureSessions];
                          newSessions[index].startTime = e.target.value;
                          setFormData(prev => ({ ...prev, lectureSessions: newSessions }));
                        }}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="End Time"
                        name={`lectureSessions[${index}].endTime`}
                        type="time"
                        value={session.endTime}
                        onChange={(e) => {
                          const newSessions = [...formData.lectureSessions];
                          newSessions[index].endTime = e.target.value;
                          setFormData(prev => ({ ...prev, lectureSessions: newSessions }));
                        }}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Room"
                        name={`lectureSessions[${index}].room`}
                        value={session.room}
                        onChange={(e) => {
                          const newSessions = [...formData.lectureSessions];
                          newSessions[index].room = e.target.value;
                          setFormData(prev => ({ ...prev, lectureSessions: newSessions }));
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      lectureSessions: [
                        ...prev.lectureSessions,
                        {
                          day: "",
                          startTime: "",
                          endTime: "",
                          room: "",
                          type: "Lecture"
                        }
                      ]
                    }));
                  }}
                  sx={{ mt: 1 }}
                >
                  Add Another Session
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
            variant="contained"
            color="primary"
          >
            {editingCourse ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Courses;
