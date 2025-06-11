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
<html>
<head>
    <title>Attendance System</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            padding: 1rem;
        }
        .container {
            text-align: center;
            background-color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 480px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        #video-container {
            position: relative;
            width: 100%;
            max-width: 480px;
            height: auto;
            aspect-ratio: 4/3;
            margin: 0 auto;
        }
        #video {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            object-fit: cover;
        }
        #overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            background-color: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        }
        #face-guide {
            width: 70%;
            height: 70%;
            border: 2px dashed #fff;
            border-radius: 50%;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
            width: 100%;
            max-width: 300px;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        #status {
            margin-top: 1rem;
            padding: 10px;
            border-radius: 5px;
            width: 100%;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
        }
        .success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            color: #a94442;
        }
        #camera-error {
            display: none;
            color: #a94442;
            margin-top: 1rem;
            padding: 10px;
            border-radius: 5px;
            background-color: #f2dede;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Attendance System</h1>
        <div id="video-container">
            <video id="video" autoplay playsinline></video>
            <div id="overlay">
                <div id="face-guide"></div>
            </div>
        </div>
        <div id="camera-error"></div>
        <button id="capture" onclick="captureImage()">Take Attendance</button>
        <div id="status"></div>
    </div>

    <script>
        const video = document.getElementById('video');
        const captureButton = document.getElementById('capture');
        const statusDiv = document.getElementById('status');
        const cameraError = document.getElementById('camera-error');
        let stream = null;

        async function setupCamera() {
            try {
                const constraints = {
                    video: {
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                        facingMode: { ideal: 'user' },
                        aspectRatio: { ideal: 1.333333 }
                    }
                };

                // Try to get the camera stream
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                video.srcObject = stream;
                cameraError.style.display = 'none';
            } catch (err) {
                console.error('Camera error:', err);
                // Try fallback with minimal constraints if the first attempt fails
                try {
                    const fallbackConstraints = {
                        video: true
                    };
                    stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                    video.srcObject = stream;
                    cameraError.style.display = 'none';
                } catch (fallbackErr) {
                    console.error('Fallback camera error:', fallbackErr);
                    cameraError.textContent = 'Error accessing camera: ' + fallbackErr.message + '. Please ensure camera permissions are granted and try again.';
                    cameraError.style.display = 'block';
                    captureButton.disabled = true;
                }
            }
        }

        function showStatus(message, type) {
            statusDiv.textContent = message;
            statusDiv.className = type;
        }

        async function captureImage() {
            if (!stream) {
                showStatus('Camera not initialized', 'error');
                return;
            }

            captureButton.disabled = true;
            showStatus('Processing...', '');

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            try {
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                const formData = new FormData();
                formData.append('image', blob, 'photo.jpg');

                const response = await fetch('http://localhost:5000/recognize', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (response.ok) {
                    if (data.label === 'unknown') {
                        showStatus('Face not recognized. Please try again.', 'error');
                    } else {
                        showStatus(data.message, 'success');
                    }
                } else {
                    showStatus(data.error || 'Error processing image', 'error');
                }
            } catch (err) {
                showStatus('Error: ' + err.message, 'error');
            } finally {
                captureButton.disabled = false;
            }
        }

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
            } else {
                setupCamera();
            }
        });

        // Initialize camera when page loads
        setupCamera();
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
      const blob = new Blob([ATTENDANCE_HTML], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance.html";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      // Open the downloaded file
      window.open("file:///storage/Downloads/attendance.html", "_blank");
    } catch (error) {
      setError("Failed to download attendance page");
      setOpenSnackbar(true);
      console.error("Error:", error);
    }
  };

  const calculateCourseStats = (course) => {
    const totalLectures =
      course.attendedLectures.length + course.missedLectures.length;
    const totalSections = course.sections.reduce(
      (acc, section) =>
        acc + section.attendedSessions.length + section.missedSessions.length,
      0
    );
    const totalSessions = totalLectures + totalSections;
    const attendedSessions =
      course.attendedLectures.length +
      course.sections.reduce(
        (acc, section) => acc + section.attendedSessions.length,
        0
      );
    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      attendedSessions,
      missedSessions: totalSessions - attendedSessions,
      attendanceRate: attendanceRate.toFixed(1),
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
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
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Important Instructions:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Connect to the designated hall WiFi network before
                    proceeding with attendance
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
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight={200}
                >
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
                          <Box sx={{ width: "100%" }}>
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
                              <strong>Total Sessions:</strong>{" "}
                              {stats.totalSessions}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              <strong>Attended:</strong>{" "}
                              {stats.attendedSessions}
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
                                {course.missedLectures
                                  .slice(0, 3)
                                  .map((lecture, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {formatDate(lecture.date)}
                                      </TableCell>
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

