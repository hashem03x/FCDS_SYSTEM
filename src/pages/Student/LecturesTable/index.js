import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import jsPDF from "jspdf";
import "jspdf-autotable";

const LecturesTable = () => {
  const { authToken } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetchWithAuth(
          `${BASE_URL}/api/gpa/student/courses`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setLectures(data.courses);
        } else {
          setError(data.message || "Failed to fetch lectures");
        }
      } catch (err) {
        setError("Error fetching lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [authToken]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Lectures Schedule", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = lectures.flatMap((course) =>
      course.sections.map((section) => ({
        courseCode: course.code,
        courseName: course.name,
        section: section.sectionId,
        day: section.sessions.map((s) => s.day).join(", "),
        time: section.sessions.map((s) => s.time).join(", "),
        room: section.sessions.map((s) => s.room).join(", "),
        instructor: section.instructor,
      }))
    );

    // Add table
    doc.autoTable({
      startY: 30,
      head: [
        [
          "Course Code",
          "Course Name",
          "Section",
          "Day",
          "Time",
          "Room",
          "Instructor",
        ],
      ],
      body: tableData.map((row) => [
        row.courseCode,
        row.courseName,
        row.section,
        row.day,
        row.time,
        row.room,
        row.instructor,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Save the PDF
    doc.save("lectures-schedule.pdf");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 6 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Lectures Schedule</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeIcon icon={faFilePdf} />}
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Course Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Course Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Section</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Room</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Instructor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lectures.map((course) =>
              course.sections.map((section) => (
                <TableRow
                  key={`${course.code}-${section.sectionId}`}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{section.sectionId}</TableCell>
                  <TableCell>
                    {section.sessions.map((session) => session.day).join(", ")}
                  </TableCell>
                  <TableCell>
                    {section.sessions.map((session) => session.time).join(", ")}
                  </TableCell>
                  <TableCell>
                    {section.sessions.map((session) => session.room).join(", ")}
                  </TableCell>
                  <TableCell>{section.instructor}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LecturesTable; 