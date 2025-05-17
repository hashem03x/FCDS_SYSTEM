import React from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const pages = [
    { label: "Users", path: "/admin/users" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Sections", path: "/admin/sections" },
    { label: "Complaints", path: "/admin/complaints" },
    { label: "Fees", path: "/admin/fees" },
    { label: "Exams", path: "/admin/exams" },
    { label: "Grades", path: "/admin/grades" },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate("/admin")}>
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Admin 🎉
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Choose a section to manage:
        </Typography>

        <Grid container spacing={3}>
          {pages.map((page) => (
            <Grid item xs={12} sm={6} md={4} key={page.path}>
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 6 },
                }}
                onClick={() => navigate(page.path)}
              >
                <CardContent>
                  <Typography variant="h6">{page.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage {page.label.toLowerCase()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
