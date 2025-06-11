import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faCalendarXmark,
  faPercent,
  faChevronDown,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";

const Attendance = () => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user, authToken } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState("");
  const [ipError, setIpError] = useState("");

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendence/history`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        method: "GET",
      });
      const data = await response.json();
      setAttendanceStats(data);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateIpAddress = (ip) => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) {
      setIpError("Please enter a valid IP address (e.g., 192.168.1.17)");
      return false;
    }
    const parts = ip.split('.');
    const isValid = parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
    if (!isValid) {
      setIpError("Each number in the IP address must be between 0 and 255");
      return false;
    }
    setIpError("");
    return true;
  };

  const startAttendance = () => {
    if (!validateIpAddress(ipAddress)) {
      return;
    }
    // Open attendance page in new tab
    window.open(`http://${ipAddress}:5000`, '_blank');
  };

  const calculateCourseStats = (course) => {
    const totalLectures = course.attendedLectures.length + course.missedLectures.length;
    const totalSections = course.sections.reduce(
      (acc, section) => acc + section.attendedSessions.length + section.missedSessions.length,
      0
    );
    const totalSessions = totalLectures + totalSections;
    const attendedSessions = course.attendedLectures.length + 
      course.sections.reduce((acc, section) => acc + section.attendedSessions.length, 0);
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      attendedSessions,
      missedSessions: totalSessions - attendedSessions,
      attendanceRate: attendanceRate.toFixed(1),
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h4" className="mb-5" gutterBottom>
                Attendance System
              </Typography>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Take Attendance
                </Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Important Instructions:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Connect to the designated hall WiFi network before proceeding with attendance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Enter the server IP address provided by your instructor
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Server IP Address"
                  variant="outlined"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  error={!!ipError}
                  helperText={ipError}
                  placeholder="e.g., 192.168.1.17"
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={startAttendance}
                  sx={{ mb: 2 }}
                  disabled={!ipAddress}
                >
                  Open Attendance Page
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ p: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Attendance Stats
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : attendanceStats?.data ? (
                <>
                  <Divider sx={{ my: 2 }} />

                  {attendanceStats.data.courses.map((course) => {
                    const stats = calculateCourseStats(course);
                    return (
                      <Accordion key={course.code} sx={{ mb: 2 }}>
                        <AccordionSummary
                          expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {course.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Attendance Rate: {stats.attendanceRate}%
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Total Sessions:</strong> {stats.totalSessions}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              <strong>Attended:</strong> {stats.attendedSessions}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              <strong>Missed:</strong> {stats.missedSessions}
                            </Typography>
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Recent Absences:
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Time</TableCell>
                                  <TableCell>Room</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {course.missedLectures.slice(0, 3).map((lecture, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{formatDate(lecture.date)}</TableCell>
                                    <TableCell>{lecture.time}</TableCell>
                                    <TableCell>{lecture.room}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </>
              ) : (
                <Typography color="text.secondary">
                  No attendance data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        {error ? (
          <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
            {error}
          </Alert>
        ) : null}
      </Snackbar>
    </Container>
  );
};

export default Attendance;

export async function encryptNumber(number, keyString) {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(number.toString());
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyString),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // Combine iv + ciphertext
  const encryptedBytes = new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);

  return btoa(String.fromCharCode(...encryptedBytes));
}
