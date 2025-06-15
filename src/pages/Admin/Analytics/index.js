import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
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
} from "@mui/material";
import axios from "axios";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
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
        </Grid>

        <Grid item xs={12}>
          <Card>
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
