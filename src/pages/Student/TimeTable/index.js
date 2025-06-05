import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

const Timetable = ({ data }) => {
  const { user , authToken } = useAuth();
  const [timeTableData, setTimeTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchTimeTable = async () => {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/student/time-table/${user?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      setTimeTableData(data.timetable);
      setIsLoading(false);
    };
    fetchTimeTable();
  }, []);
  const days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];
  const timeSlots = [
    "8:30 AM",
    "10:30 AM",
    "12:30 PM",
    "2:30 PM",
    "4:30 PM",
    "8:30 PM",
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#90CAF9" }}>
            <TableCell></TableCell>
            {timeSlots.map((time) => (
              <TableCell
                key={time}
                align="center"
                style={{ fontWeight: "bold" }}
              >
                {time}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "#E8EBEE" }}>
          {days.map((day) =>
            isLoading ? (
              <TableRow key={day}>
                <TableCell colSpan={timeSlots.length + 1}>
                  <Skeleton width="100%" height={50} />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={day}>
                <TableCell style={{ fontWeight: "bold" }}>
                  {day.substring(0, 3).toUpperCase()}
                </TableCell>
                {timeSlots.map((time) => {
                  const classInfo = timeTableData[day]?.find(
                    (session) => session.startTime === time
                  );
                  return (
                    <TableCell
                      sx={{ border: "1px solid #D4DDE7" }}
                      key={time}
                      align="center"
                    >
                      {classInfo ? (
                        <div>
                          <strong>{classInfo.name}</strong>
                          <br />
                          {classInfo.type} ({classInfo.room})
                          <br />
                          {classInfo.doctorName || classInfo.teachingAssistant}
                        </div>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Timetable;
