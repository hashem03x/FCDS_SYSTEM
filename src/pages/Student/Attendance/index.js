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

const ATTENDANCE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            width: 100%;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .video-container {
            width: 100%;
            max-width: 640px;
            margin: 20px auto;
            position: relative;
        }
        #video {
            width: 100%;
            border-radius: 8px;
        }
        #canvas {
            display: none;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        button {
            background-color: #1976d2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #1565c0;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        #status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .success {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        .error {
            background-color: #ffebee;
            color: #c62828;
        }
        #camera-error {
            color: #c62828;
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background-color: #ffebee;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Attendance System</h1>
        <div id="camera-error">
            Please allow camera access to take attendance.
            <br>
            If you've denied access, please refresh the page and try again.
        </div>
        <div class="video-container">
            <video id="video" autoplay playsinline></video>
            <canvas id="canvas"></canvas>
        </div>
        <div class="button-container">
            <button id="captureBtn" disabled>Take Attendance</button>
        </div>
        <div id="status"></div>
    </div>

    <script>
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const captureBtn = document.getElementById('captureBtn');
        const status = document.getElementById('status');
        const cameraError = document.getElementById('camera-error');

        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            cameraError.style.display = 'block';
            cameraError.textContent = 'Your browser does not support camera access. Please use a modern browser.';
            return;
        }

        // Set up camera
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                video.srcObject = stream;
                captureBtn.disabled = false;
                cameraError.style.display = 'none';
            } catch (err) {
                console.error('Error accessing camera:', err);
                cameraError.style.display = 'block';
                captureBtn.disabled = true;
            }
        }

        // Capture image and send to server
        async function captureImage() {
            try {
                captureBtn.disabled = true;
                status.textContent = 'Processing...';
                status.className = '';

                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw video frame to canvas
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                
                // Create form data
                const formData = new FormData();
                formData.append('image', blob, 'attendance.jpg');

                // Send to server
                const response = await fetch('http://localhost:5000/recognize', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    status.textContent = 'Attendance marked successfully!';
                    status.className = 'success';
                } else {
                    throw new Error(result.message || 'Failed to mark attendance');
                }
            } catch (err) {
                console.error('Error:', err);
                status.textContent = err.message || 'Failed to mark attendance';
                status.className = 'error';
            } finally {
                captureBtn.disabled = false;
            }
        }

        // Initialize
        setupCamera();
        captureBtn.addEventListener('click', captureImage);
    </script>
</body>
</html>
`;

const Attendance = () => {
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user, authToken } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const startAttendance = () => {
    try {
      // Create a blob from the HTML content
      const blob = new Blob([ATTENDANCE_HTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'attendance.html';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      // Open the downloaded file
      window.open('file:///storage/Downloads/attendance.html', '_blank');
    } catch (error) {
      setError('Failed to download attendance page');
      setOpenSnackbar(true);
      console.error('Error:', error);
    }
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
                    • Click the button below to open the attendance page
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={startAttendance}
                  sx={{ mb: 2 }}
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
