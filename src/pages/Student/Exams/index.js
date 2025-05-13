import React, { useEffect, useState } from "react";
import { Box, Typography, Skeleton, Grid, Paper } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import { Card, StudentCardSVG, StudentDetails } from "../Dashboard";

const ExamCard = ({ exam }) => {
  const date = new Date(exam.date);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.toLocaleDateString("en-GB").split("/")[0];

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
        height="105px"
        gap={2}
        mb={1}
        sx={{
          color: "#373C61",
          background: "#DCE8FE",
          borderRadius: "12px",
          px: 2,
          py: 0.5,
          width: "fit-content",
        }}
      >
        <Typography fontWeight="bold">{day}</Typography>
        <Typography>
          {`${dayNum < 10 ? "0" + dayNum : dayNum}/${
            date.getMonth() + 1 < 10
              ? "0" + (date.getMonth() + 1)
              : date.getMonth() + 1
          }`}
        </Typography>
      </Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 2,
          width: "389px",
          height: "105px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography fontWeight="bold" color="#373C61">
          {exam.courseName}
        </Typography>
        <Typography color="#8B8989" variant="body2">
          {exam.examType}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          🕒 <Typography color="#373C61">{exam.time}</Typography>
          🏛️ <Typography color="#373C61">{exam.location}</Typography>
        </Box>
      </Paper>
    </>
  );
};

const ExamTimetable = () => {
  const { user , authToken} = useAuth();
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
              Authorization: `Bearer ${authToken}`,
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
    <>
      <Card>
        <StudentDetails />
        <StudentCardSVG />
      </Card>

      <Typography
        variant="h6"
        align="center"
        mt={4}
        mb={2}
        sx={{
          backgroundColor: "#DE8811",
          color: "white",
          borderRadius: "10px",
          padding: "5px",
        }}
      >
        Exams
      </Typography>

      <Box
        padding="15px 0"
        display="flex"
        flexWrap="wrap"
        gap={3}
        justifyContent="center"
      >
        {loading ? (
          [...Array(2)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={280}
              height={140}
              sx={{ borderRadius: 2 }}
            />
          ))
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
          exams.map((exam, idx) => <ExamCard key={idx} exam={exam} />)
        )}
      </Box>
    </>
  );
};

export default ExamTimetable;
