import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({
    topByLevel: {},
    topByDepartment: {},
    highestCourseGrades: [],
    departmentPerformance: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [levelRes, deptRes, gradesRes, perfRes] = await Promise.all([
        axios.get("https:fcdsanalytics-production.up.railway.app/api/analytics/top-by-level"),
        axios.get("https:fcdsanalytics-production.up.railway.app/api/analytics/top-by-department"),
        axios.get("https:fcdsanalytics-production.up.railway.app/api/analytics/highest-course-grades"),
        axios.get("https:fcdsanalytics-production.up.railway.app/api/analytics/department-performance"),
      ]);

      setAnalyticsData({
        topByLevel: levelRes.data,
        topByDepartment: deptRes.data,
        highestCourseGrades: gradesRes.data,
        departmentPerformance: perfRes.data,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Top Students by Level" />
        <Tab label="Top Students by Department" />
        <Tab label="Highest Course Grades" />
        <Tab label="Department Performance" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {Object.entries(analyticsData.topByLevel).map(([level, students]) => (
            <Grid item xs={12} key={level}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {level} Level Top Students
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>CGPA</TableCell>
                          <TableCell>Term GPA</TableCell>
                          <TableCell>Credit Hours</TableCell>
                          <TableCell>A Grades %</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.studentId}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>{student.cgpa}</TableCell>
                            <TableCell>{student.termGpa}</TableCell>
                            <TableCell>{student.totalCreditHours}</TableCell>
                            <TableCell>{student.aGradesPercentage}%</TableCell>
                            <TableCell>{student.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box mt={2}>
                    <img
                      src={`https://fcdsanalytics-production.up.railway.app/api/analytics/visualization/level/${level}`}
                      alt={`Top students in ${level}`}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {Object.entries(analyticsData.topByDepartment).map(([dept, students]) => (
            <Grid item xs={12} key={dept}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dept} Department Top Students
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Academic Level</TableCell>
                          <TableCell>CGPA</TableCell>
                          <TableCell>Term GPA</TableCell>
                          <TableCell>Credit Hours</TableCell>
                          <TableCell>A Grades %</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.studentId}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>{student.academicLevel}</TableCell>
                            <TableCell>{student.cgpa}</TableCell>
                            <TableCell>{student.termGpa}</TableCell>
                            <TableCell>{student.totalCreditHours}</TableCell>
                            <TableCell>
                              {student.aGradesPercentage}%
                            </TableCell>
                            <TableCell>{student.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box mt={2}>
                    <img
                      src={`https://fcdsanalytics-production.up.railway.app/api/analytics/visualization/department/${dept}`}
                      alt={`Top students in ${dept}`}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Highest Course Grades
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Course Name</TableCell>
                        <TableCell>Highest Mark</TableCell>
                        <TableCell>Number of Students</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.highestCourseGrades.map((course) => (
                        <TableRow key={course.courseCode}>
                          <TableCell>{course.courseCode}</TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell>{course.highestMark}</TableCell>
                          <TableCell>{course.studentCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box mt={2}>
                  <img
                    src="https://fcdsanalytics-production.up.railway.app/api/analytics/visualization/courses/all"
                    alt="Top courses visualization"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Performance
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell>Average Mark</TableCell>
                        <TableCell>Number of Students</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.departmentPerformance.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell>{dept.department}</TableCell>
                          <TableCell>{dept.averageMark}</TableCell>
                          <TableCell>{dept.studentCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box mt={2}>
                  <img
                    src="https://fcdsanalytics-production.up.railway.app/api/analytics/visualization/performance/all"
                    alt="Department performance visualization"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;
