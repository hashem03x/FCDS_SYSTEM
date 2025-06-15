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
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

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
      console.error("Error fetching analytics data:", error);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overall Statistics" />
        <Tab label="Top Students by Department" />
        <Tab label="Top Students by Department & Level" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Statistics
                </Typography>
                <Typography>
                  Total Students: {analyticsData.overall_stats.total_students}
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 5 Students Overall
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Academic Level</TableCell>
                        <TableCell>CGPA</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.top_5_overall.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{student.Name}</TableCell>
                          <TableCell>{student.Department}</TableCell>
                          <TableCell>{student['Academic Level']}</TableCell>
                          <TableCell>{student.CGPA}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {Object.entries(analyticsData.top_10_by_department).map(([dept, students]) => (
            <Grid item xs={12} key={dept}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dept} Department - Top 10 Students
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Academic Level</TableCell>
                          <TableCell>CGPA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell>{student.Name}</TableCell>
                            <TableCell>{student['Academic Level']}</TableCell>
                            <TableCell>{student.CGPA}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {Object.entries(analyticsData.top_10_by_dept_level).map(([dept, levels]) => (
            <Grid item xs={12} key={dept}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dept} Department
                  </Typography>
                  {Object.entries(levels).map(([level, students]) => (
                    <Box key={level} sx={{ mb: 3 }}>
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
                            {students.map((student, index) => (
                              <TableRow key={index}>
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
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;
