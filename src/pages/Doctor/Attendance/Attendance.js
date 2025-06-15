import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useDoctor } from '../../../context/DoctorContext';
import { useAuth } from '../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import UploadAttendanceModal from './UploadAttendanceModal';

const Attendance = () => {
  const { courses } = useDoctor();
  const { authToken } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const fetchAttendance = async (courseCode) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://college-system-two.vercel.app/api/attendence/report/lecture/${courseCode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const csvData = await response.text();
      // Parse CSV data
      const rows = csvData.split('\n').map(row => {
        const [studentId, studentName, totalSessions, present, late, absent, percentage] = row.split(',').map(item => item.replace(/"/g, ''));
        return {
          studentId,
          studentName,
          totalSessions: parseInt(totalSessions),
          present: parseInt(present),
          late: parseInt(late),
          absent: parseInt(absent),
          percentage
        };
      });
      // Remove header row
      rows.shift();
      setAttendanceData(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (event) => {
    const courseCode = event.target.value;
    setSelectedCourse(courseCode);
    if (courseCode) {
      fetchAttendance(courseCode);
    } else {
      setAttendanceData([]);
    }
  };

  // Fetch attendance data when component mounts if a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchAttendance(selectedCourse);
    }
  }, [selectedCourse]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Attendance Management</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={handleCourseChange}
              label="Select Course"
            >
              {courses?.map((course) => (
                <MenuItem key={course.code} value={course.code}>
                  {course.name} ({course.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faUpload} />}
            onClick={() => setOpenUploadModal(true)}
            disabled={!selectedCourse}
          >
            Upload Attendance
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Total Sessions</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>Late</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.studentId}</TableCell>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.totalSessions}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {record.present}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                      {record.late}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {record.absent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: parseFloat(record.percentage) >= 75 ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {record.percentage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <UploadAttendanceModal
        open={openUploadModal}
        handleClose={() => setOpenUploadModal(false)}
        courseCode={selectedCourse}
        onSuccess={() => {
          setOpenUploadModal(false);
          fetchAttendance(selectedCourse);
        }}
      />
    </Box>
  );
};

export default Attendance; 