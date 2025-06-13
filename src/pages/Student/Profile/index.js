import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../utils/api";
import "./Profile.css";

const Profile = () => {
  const { user, authToken } = useAuth();
  const [fees, setFees] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch fees data
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/fees/get-fee-Bystudent/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setFees(data);
        } else {
          throw new Error(data.message || "Failed to fetch fees");
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#2F748F",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchFees();
    }
  }, [user?.id, authToken]);

  // Handle profile picture change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        Swal.fire({
          title: "Error!",
          text: "File size should be less than 5MB",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#2F748F",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleProfilePictureUpdate = async () => {
    if (!selectedFile) return;

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const response = await fetch(
        `${BASE_URL}/api/auth/update-profile-picture/${user.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Create a temporary URL for the new image
        const imageUrl = URL.createObjectURL(selectedFile);
        // Update the user context with the new image URL
        user.profilePicture = imageUrl;
        
        await Swal.fire({
          title: "Success!",
          text: "Profile picture updated successfully",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2F748F",
        });
        setSelectedFile(null);
      } else {
        throw new Error(data.message || "Failed to update profile picture");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2F748F",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: "Error!",
        text: "New passwords do not match",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2F748F",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(
        `${BASE_URL}/api/auth/change-password/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "Success!",
          text: "Password changed successfully",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#2F748F",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(data.message || "Failed to change password");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2F748F",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box className="profile-container">
      <Grid container spacing={3}>
        {/* Profile Picture Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} className="profile-section">
            <Box className="profile-picture-container">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  className="profile-picture"
                />
              ) : (
                <Avatar
                  alt={user?.name}
                  sx={{ width: 150, height: 150 }}
                  className="profile-picture"
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="profile-picture-input"
              />
              <label htmlFor="profile-picture-input">
                <Button
                  variant="contained"
                  component="span"
                  disabled={isUpdating}
                  className="change-picture-button"
                >
                  Change Picture
                </Button>
              </label>
              {selectedFile && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProfilePictureUpdate}
                  disabled={isUpdating}
                  className="update-picture-button"
                >
                  {isUpdating ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Update Picture"
                  )}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Fees Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} className="profile-section">
            <Typography variant="h6" gutterBottom>
              Fees Information
            </Typography>
            {isLoading ? (
              <CircularProgress />
            ) : fees ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {console.log(fees)}
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Fees
                      </Typography>
                      <Typography variant="h5">
                        {fees?.reduce((total, fee) => total + fee.amount, 0)}{" "}
                        EGP
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Status
                      </Typography>
                      <Typography variant="h5">
                        {fees?.map((fee) => fee.status)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Due Date
                      </Typography>
                      {fees.map((fee) => (
                        <Typography
                          key={fee._id}
                          variant="h5"
                          color={
                            new Date(fee.dueDate) < new Date()
                              ? "error"
                              : "success"
                          }
                        >
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography color="error">
                No fees information available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Password Change Section */}
        <Grid item xs={12}>
          <Paper elevation={3} className="profile-section">
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={handlePasswordChange}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isUpdating}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isUpdating}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isUpdating}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isUpdating}
                    className="change-password-button"
                  >
                    {isUpdating ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
