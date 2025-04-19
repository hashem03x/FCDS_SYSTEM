import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";

const ExamTimetable = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/student/exams/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
            },
          }
        );
        const data = await response.json();
        setExams(data.exams || []);
        setMessage(data.message || "");
        setSuggestions(data.suggestions || []);
      } catch (error) {
        setMessage("Error fetching exams");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Exam Timetable
      </Typography>

      {loading ? (
        <Box p={2}>
          {[...Array(3)].map((_, index) => (
            <Box key={index} display="flex" gap={2} mb={1}>
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="25%" />
              <Skeleton variant="text" width="20%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="15%" />
            </Box>
          ))}
        </Box>
      ) : exams.length === 0 ? (
        <Box textAlign="center" py={2}>
          <Typography variant="body1">{message}</Typography>

          {suggestions.length > 0 && (
            <Box mt={2}>
              {suggestions.map((suggestion, idx) => (
                <Typography key={idx} variant="body2" color="text.secondary">
                  • {suggestion}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam, idx) => (
              <TableRow key={idx}>
                <TableCell>{exam.courseCode}</TableCell>
                <TableCell>{exam.courseName}</TableCell>
                <TableCell>
                  {new Date(exam.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{exam.time}</TableCell>
                <TableCell>{exam.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default ExamTimetable;
