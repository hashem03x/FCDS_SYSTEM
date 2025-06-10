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
  Stack,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faFilePen,
  faPlus,
  faClipboardList,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../../context/AdminContext";
import { Form } from "react-router-dom";

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
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [selectedTA, setSelectedTA] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const { teachingAssistants } = useAdmin();
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

  const handleOpenForm = (course = null, section = null) => {
    if (course) {
      setSelectedCourseCode(course.code);
    }
    if (section) {
      setIsEditingSection(true);
      setSelectedSectionId(section.sectionId);
      setFormData({
        sectionId: section.sectionId,
        taId: section.taId,
        capacity: section.capacity,
        sessions: section.sessions || [
          { day: "", startTime: "", endTime: "", room: "", type: "Section" },
        ],
      });
    } else {
      setIsEditingSection(false);
      setSelectedSectionId(null);
      setFormData(initialFormState);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormState);
    setIsEditingSection(false);
    setSelectedSectionId(null);
  };

  const handleAddSection = async () => {
    if (!selectedCourseCode) {
      Swal.fire("Error", "Please select a course", "error");
      return;
    }

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
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire(
          "Success",
          isEditingSection
            ? "Section updated successfully"
            : "Section added successfully",
          "success"
        );
        handleClose();
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

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    return (
      course.name?.toLowerCase().includes(search) ||
      course.code?.toLowerCase().includes(search) ||
      course.sections?.some((section) =>
        section.sectionId?.toLowerCase().includes(search)
      )
    );
  });

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
          Manage Sections
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
          Add New Section
        </Button>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      <TextField
        label="Search by Course or Section"
        variant="outlined"
        size="small"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {filteredCourses.map((course) => (
        <Accordion
          key={course._id}
          expanded={expandedCourse === course._id}
          onChange={() =>
            setExpandedCourse(expandedCourse === course._id ? null : course._id)
          }
          sx={{
            mb: 2,
            borderRadius: "8px !important",
            "&:before": { display: "none" },
            boxShadow: 2,
          }}
        >
          <AccordionSummary
            expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
            sx={{
              backgroundColor: "white",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h6">
                {course.name} ({course.code})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.sections?.length || 0} Sections
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {course.sections?.map((section) => (
                <Grid item xs={12} md={6} key={section.sectionId}>
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
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Section {section.sectionId}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit Section">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenForm(course, section)}
                              color="primary"
                            >
                              <FontAwesomeIcon icon={faFilePen} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Section">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteSection(
                                  course.code,
                                  section.sectionId
                                )
                              }
                              color="error"
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="body2">
                          {teachingAssistants.map((ta) =>
                            ta.id === section.taId ? (
                              <span>
                                <strong>TA:</strong> {ta.name}
                              </span>
                            ) : null
                          )}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Capacity:</strong> {section.capacity}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong>{" "}
                          <Chip
                            label={section.isFull ? "Full" : "Available"}
                            color={section.isFull ? "error" : "success"}
                            size="small"
                          />
                        </Typography>

                        {section.sessions?.map((session, index) => (
                          <Box
                            key={index}
                            sx={{
                              mt: 1,
                              p: 1,
                              backgroundColor: "grey.100",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2">
                              <strong>Day:</strong> {session.day}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Time:</strong> {session.startTime} -{" "}
                              {session.endTime}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Room:</strong> {session.room}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          {isEditingSection ? "Edit Section" : "Add New Section"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  label="Select Course"
                  disabled={isEditingSection}
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course.code}>
                      {course.name} ({course.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section ID"
                fullWidth
                value={formData.sectionId}
                onChange={(e) =>
                  setFormData({ ...formData, sectionId: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Teaching Assistant</InputLabel>
                <Select
                  value={selectedTA}
                  onChange={(e) => setSelectedTA(e.target.value)}
                  label="Select TA"
                  disabled={isEditingSection}
                >
                  {console.log(teachingAssistants)}
                  {teachingAssistants.map((ta) => (
                    <MenuItem key={ta.id} value={ta.name}>
                      {ta.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacity"
                type="number"
                fullWidth
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Day"
                fullWidth
                value={formData.sessions[0]?.day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessions: [
                      { ...formData.sessions[0], day: e.target.value },
                    ],
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={formData.sessions[0]?.startTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessions: [
                      { ...formData.sessions[0], startTime: e.target.value },
                    ],
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={formData.sessions[0]?.endTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessions: [
                      { ...formData.sessions[0], endTime: e.target.value },
                    ],
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Room"
                fullWidth
                value={formData.sessions[0]?.room}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessions: [
                      { ...formData.sessions[0], room: e.target.value },
                    ],
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAddSection}
            variant="contained"
            disabled={!selectedCourseCode}
          >
            {isEditingSection ? "Update Section" : "Add Section"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sections;
