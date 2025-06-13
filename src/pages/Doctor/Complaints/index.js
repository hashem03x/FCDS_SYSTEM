import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";

export default function DoctorComplaints() {
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authToken, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/complaint/send-complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
          role: "doctor",
          complaint: complaint,
          complaintId: Date.now().toString()
        }),
      });

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Complaint submitted successfully",
          icon: "success",
        });
        setComplaint(""); // Clear the form
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit complaint");
      }
    } catch (err) {
      setError(err.message || "Failed to submit complaint");
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to submit complaint",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Submit a Complaint
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !complaint.trim()}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
} 