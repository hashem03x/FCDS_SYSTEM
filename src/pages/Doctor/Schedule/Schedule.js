import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

const Schedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken, user } = useAuth();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const url = `https://college-system-two.vercel.app/api/student/time-table/${user?.id}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        if (data.timetable) {
          setSchedule(data.timetable);
        } else {
          throw new Error(data.message || 'Failed to fetch schedule');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Failed to fetch schedule. Please try again later.');
        setLoading(false);
      }
    };

    if (user?.id) {
      console.log('User ID found, fetching schedule...');
      fetchSchedule();
    } else {
      console.log('No user ID found');
      setLoading(false);
      setError('User information not available');
    }
  }, [authToken, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Schedule
      </Typography>
      {days.map((day) => (
        schedule[day] && (
          <Box key={day} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
              {day}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Course Name</TableCell>
                    <TableCell>Course Code</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule[day].map((lecture, index) => (
                    <TableRow key={index}>
                      <TableCell>{lecture.type}</TableCell>
                      <TableCell>{lecture.name}</TableCell>
                      <TableCell>{lecture.code}</TableCell>
                      <TableCell>{lecture.room}</TableCell>
                      <TableCell>{`${lecture.startTime} - ${lecture.endTime}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )
      ))}
    </Box>
  );
};

export default Schedule; 