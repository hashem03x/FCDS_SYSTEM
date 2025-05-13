import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
} from "@mui/material";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { Box, Skeleton, Typography } from "@mui/material";

function StudentPerformance() {
  const { user, authToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [performance, setPerformance] = useState([]);
  const [passedCourses, setPassedCourses] = useState([]);
  const fetchPerformance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/gpa/performance/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPerformance(data.performance);
      setPassedCourses(data.performance.passedCourses);
    } catch (error) {
      console.error("Failed to fetch performance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !authToken) return;
    fetchPerformance();
  }, [user?.id, authToken]);

  return (
    <div>
      <Typography fontSize="32px">Performance</Typography>
      {isLoading ? (
        <Skeleton height={100} variant="text" animation="wave" />
      ) : (
        <PerformanceSummary
          passedCourses={passedCourses}
          performance={performance}
        />
      )}
    </div>
  );
}

const PerformanceSummary = ({ performance, passedCourses }) => {
  return (
    <>
      <Box
        sx={{
          boxShadow: "0px 10px 60px 0px #E2ECF980",
          borderRadius: "30px",
          backgroundColor: "white",
          padding: "24px 32px",
        }}
      >
        <div className="row flex-wrap">
          <div className="col-lg-4 col-md-6 col-sm-12 d-flex align-items-center mb-4">
            <div className="me-3">
              <svg
                width="91"
                height="84"
                viewBox="0 0 91 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="45.5078"
                  cy="42"
                  rx="45.4277"
                  ry="42"
                  fill="url(#paint0_linear_990_5984)"
                />
                <g clip-path="url(#clip0_990_5984)">
                  <path
                    d="M61.324 26.3398L66.2868 29.8013L44.769 60.66H39.8062L27.8066 43.9418L32.7694 39.3388L42.2876 48.1766L61.324 26.3398Z"
                    fill="#00AC4F"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_990_5984"
                    x1="80.7142"
                    y1="2.14197e-06"
                    x2="50.0387"
                    y2="85.6233"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#D3FFE7" />
                    <stop offset="1" stop-color="#EFFFF6" />
                  </linearGradient>
                  <clipPath id="clip0_990_5984">
                    <rect
                      width="42.6402"
                      height="42.6402"
                      fill="white"
                      transform="translate(23.6465 22.1797)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="d-flex flex-column">
              <Typography fontSize="14px" color="#ACACAC">
                Passed
              </Typography>
              <Typography
                className="d-flex align-items-center"
                fontSize="32px"
                fontWeight="bold"
              >
                {performance.passedCourses?.length}
                <span
                  className="ms-2"
                  style={{
                    fontSize: "12px",
                    color: "#ACACAC",
                    fontWeight: "normal",
                  }}
                >
                  Subjects
                </span>
              </Typography>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12 d-flex align-items-center mb-4">
            <div className="me-3">
              <svg
                width="91"
                height="84"
                viewBox="0 0 91 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="45.4394"
                  cy="42"
                  rx="45.4277"
                  ry="42"
                  fill="url(#paint0_linear_990_6002)"
                />
                <path
                  d="M57.2317 33.0961L34.9565 54.0777M34.7472 33.2896L57.4411 53.8841"
                  stroke="#D0004B"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_990_6002"
                    x1="80.6459"
                    y1="2.14197e-06"
                    x2="49.9703"
                    y2="85.6233"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#D3FFE7" />
                    <stop offset="1" stop-color="#EFFFF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="d-flex flex-column">
              <Typography fontSize="14px" color="#ACACAC">
                Failed
              </Typography>
              <Typography
                className="d-flex align-items-center"
                fontSize="32px"
                fontWeight="bold"
              >
                0
                <span
                  className="ms-2"
                  style={{
                    fontSize: "12px",
                    color: "#ACACAC",
                    fontWeight: "normal",
                  }}
                >
                  Subjects
                </span>
              </Typography>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12 d-flex align-items-center mb-4">
            <div className="me-3">
              <svg
                width="91"
                height="84"
                viewBox="0 0 91 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="45.5556"
                  cy="42"
                  rx="45.4277"
                  ry="42"
                  fill="url(#paint0_linear_990_6019)"
                />
                <path
                  d="M56.2376 26.4668V31.2768C56.2376 34.2535 55.0552 37.1082 52.9504 39.213C50.8456 41.3178 47.9909 42.5002 45.0142 42.5002M45.0142 42.5002C42.0376 42.5002 39.1829 41.3178 37.0781 39.213C34.9733 37.1082 33.7908 34.2535 33.7908 31.2768V26.4668M45.0142 42.5002C47.9909 42.5002 50.8456 43.6827 52.9504 45.7875C55.0552 47.8923 56.2376 50.747 56.2376 53.7236V58.5336M45.0142 42.5002C42.0376 42.5002 39.1829 43.6827 37.0781 45.7875C34.9733 47.8923 33.7908 50.747 33.7908 53.7236V58.5336M32.1875 26.4668H57.841M57.841 58.5336H32.1875"
                  stroke="#00AC4F"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_990_6019"
                    x1="80.7621"
                    y1="2.14197e-06"
                    x2="50.0865"
                    y2="85.6233"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#D3FFE7" />
                    <stop offset="1" stop-color="#EFFFF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="d-flex flex-column">
              <Typography fontSize="14px" color="#ACACAC">
                Left
              </Typography>
              <Typography
                className="d-flex align-items-center"
                fontSize="32px"
                fontWeight="bold"
              >
                {performance?.remainingCreditHours}
                <span
                  className="ms-2"
                  style={{
                    fontSize: "12px",
                    color: "#ACACAC",
                    fontWeight: "normal",
                  }}
                >
                  Credit Hours
                </span>
              </Typography>
            </div>
          </div>
        </div>
      </Box>
      <CoursesTable passedCourses={passedCourses} />
    </>
  );
};

const paginationModel = { page: 0, pageSize: 5 };

function CoursesTable({ passedCourses }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // Map `passedCourses` to DataGrid rows format
  const rows = passedCourses.map((course, index) => ({
    id: course._id || `row-${index}`, // Fallback to index if `_id` is missing
    code: course.code,
    name: course.name,
    creditHours: course.creditHours,
    score: course.score,
    grade: course.grade,
    term: course.term,
  }));

  // Define DataGrid columns
  const columns = [
    { field: "code", headerName: "Course Code", width: 130 },
    { field: "name", headerName: "Course Name", width: 200 },
    { field: "creditHours", headerName: "Credit Hours", width: 130 },
    { field: "score", headerName: "Score", type: "number", width: 100 },
    { field: "term", headerName: "Term", width: 150 },
    { field: "grade", headerName: "Grade", width: 100 },
  ];
  return (
    <Paper className="mt-4 p-4">
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <Typography fontSize="22px" fontWeight="600" fontFamily="Poppins">
              Courses
            </Typography>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell sx={{ color: "#B5B7C0" }} align="center" key={index}>
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{row.code}</TableCell>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">{row.creditHours}</TableCell>
                  <TableCell align="center">{row.score}</TableCell>
                  <TableCell align="center">{row.term}</TableCell>
                  <TableCell
                    sx={
                      row.grade === "F"
                        ? { color: "red" }
                        : { color: "#00AC4F" }
                    }
                    align="center"
                  >
                    {row.grade}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        className="mt-4"
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default StudentPerformance;
