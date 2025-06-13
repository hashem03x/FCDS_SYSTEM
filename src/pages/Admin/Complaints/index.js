import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import Swal from "sweetalert2";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/complaint/get-complaints`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (data) {
        console.log(data);
        setComplaints(data);
      } else {
        throw new Error(data.message || "Failed to fetch complaints");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/complaint/resolve/${complaintId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();
      if (data.message.includes("successfully")) {
        Swal.fire({
          title: "Success!",
          text: "Complaint status updated successfully",
          icon: "success",
        });
        fetchComplaints();
      } else {
        throw new Error(data.message || "Failed to update complaint status");
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to update complaint status",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Complaints Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Complaint ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Complaint</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint._id}>
                <TableCell>{complaint.complaintId}</TableCell>
                <TableCell>
                  {complaint.userId.name}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {complaint.userId.email}
                  </Typography>
                </TableCell>
                <TableCell>{complaint.role}</TableCell>
                <TableCell>{complaint.complaint}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.complaintId, e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
