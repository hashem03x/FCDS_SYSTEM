import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Stack,
} from "@mui/material";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

const statusOptions = ["Pending", "Resolved"];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/complaint/get-complaints`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/complaint/resolve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });

      if (response.ok) {
        await fetchComplaints(); // Refresh data
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Student Complaints
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <List>
            {complaints.map((complaint) => (
              <React.Fragment key={complaint._id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ alignItems: "stretch" }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" gutterBottom>
                        {complaint.complaint}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.primary">
                          <strong>Name:</strong> {complaint.userId.name}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          <strong>Email:</strong> {complaint.userId.email}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          <strong>Role:</strong> {complaint.role}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          <strong>Date:</strong>{" "}
                          {new Date(complaint.createdAt).toLocaleString()}
                        </Typography>

                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            label="Status"
                            value={complaint.status}
                            onChange={(e) =>
                              handleStatusChange(
                                complaint.complaintId,
                                e.target.value
                              )
                            }
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    }
                  />
                  <Chip
                    label={complaint.status}
                    color={
                      complaint.status === "Resolved"
                        ? "success"
                        : complaint.status === "Pending"
                        ? "default"
                        : "warning"
                    }
                    sx={{ height: 32, mt: 1, ml: 2 }}
                  />
                </ListItem>
                <Divider sx={{ my: 2 }} />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}
