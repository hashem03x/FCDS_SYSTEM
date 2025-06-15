import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import axios from "axios";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("https://fcdsanalytics-production.up.railway.app/api/analysis");
      setAnalyticsData(response.data);
    } catch (error) {
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Student Analytics Dashboard
      </Typography>

      <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Overall Statistics" />
        <Tab label="Department Statistics" />
        <Tab label="Academic Level Statistics" />
      </Tabs>

      {/* Tab 1: Overall Statistics + Top 5 Students */}
      {tab === 0 && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Statistics
              </Typography>
              <Typography>
                <b>Total Students:</b> {analyticsData.overall_stats.total_students}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                CGPA Statistics:
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {Object.entries(analyticsData.overall_stats.cgpa_stats).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{typeof value === 'number' ? value.toFixed(2) : value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Students Overall
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Academic Level</TableCell>
                      <TableCell>CGPA</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.top_5_overall.map((student, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{student.Name}</TableCell>
                        <TableCell>{student.Department}</TableCell>
                        <TableCell>{student["Academic Level"]}</TableCell>
                        <TableCell>{student.CGPA}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab 2: Department Statistics + Top 10 by Department */}
      {tab === 1 && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Statistics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Students</TableCell>
                      <TableCell>Avg CGPA</TableCell>
                      <TableCell>Min CGPA</TableCell>
                      <TableCell>Max CGPA</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analyticsData.department_stats).map(([dept, stats]) => (
                      <TableRow key={dept}>
                        <TableCell>{dept}</TableCell>
                        <TableCell>{stats.student_count}</TableCell>
                        <TableCell>{stats.cgpa_mean.toFixed(2)}</TableCell>
                        <TableCell>{stats.cgpa_min.toFixed(2)}</TableCell>
                        <TableCell>{stats.cgpa_max.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {Object.entries(analyticsData.top_10_by_department).map(([dept, students]) => (
            <Card key={dept} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 Students - {dept}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Academic Level</TableCell>
                        <TableCell>CGPA</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{student.Name}</TableCell>
                          <TableCell>{student["Academic Level"]}</TableCell>
                          <TableCell>{student.CGPA}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Tab 3: Academic Level Statistics + Top 10 by Dept & Level */}
      {tab === 2 && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Level Statistics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Level</TableCell>
                      <TableCell>Students</TableCell>
                      <TableCell>Avg CGPA</TableCell>
                      <TableCell>Min CGPA</TableCell>
                      <TableCell>Max CGPA</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analyticsData.level_stats).map(([level, stats]) => (
                      <TableRow key={level}>
                        <TableCell>Level {level}</TableCell>
                        <TableCell>{stats.student_count}</TableCell>
                        <TableCell>{stats.cgpa_mean.toFixed(2)}</TableCell>
                        <TableCell>{stats.cgpa_min.toFixed(2)}</TableCell>
                        <TableCell>{stats.cgpa_max.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {Object.entries(analyticsData.top_10_by_dept_level).map(([dept, levels]) => (
            <Card key={dept} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 Students by Level - {dept}
                </Typography>
                {Object.entries(levels).map(([level, students]) => (
                  <Box key={level} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Academic Level {level}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>CGPA</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {students.map((student, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{student.Name}</TableCell>
                              <TableCell>{student.CGPA}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default Analytics;
