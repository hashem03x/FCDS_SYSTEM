import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import "./Complaints.css";
import { BASE_URL } from "../../../utils/api";

const Complaints = () => {
  const { user, authToken } = useAuth();
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/complaint/send-complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            complaintId: Date.now().toString(), // Generate a unique ID
            userId: user.id,
            role: "student",
            complaint: complaint,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "Success!",
          text: "Your complaint has been submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2F748F",
        });
        setComplaint("");
      } else {
        throw new Error(data.message || "Failed to submit complaint");
      }
    } catch (error) {
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to submit complaint. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2F748F",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="complaints-container">
      <Paper elevation={3} className="complaints-paper">
        <Typography variant="h5" component="h2" gutterBottom>
          Submit a Complaint
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Please describe your complaint in detail. We will review it and take
          appropriate action.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Your Complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
            className="complaint-textfield"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="submit-button mt-4 position-relative"
            disabled={!complaint.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                    color: "white",
                  }}
                />
                <span style={{ visibility: "hidden" }}>Submit Complaint</span>
              </>
            ) : (
              "Submit Complaint"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Complaints;
