import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  CardContent,
  Divider,
  TextField,
  Collapse,
} from "@mui/material";
import { faCamera, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import Swal from "sweetalert2";

function Settings() {
  const { userPhoto, user } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const updatePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/api/auth/update-profile-picture/${user?.id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(URL.createObjectURL(file));
        alert("Profile picture updated successfully!");
      } else {
        console.error("Upload failed:", data);
        alert("Failed to update profile picture.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography fontSize="40px" fontWeight="bold" mb={1}>
        Settings
      </Typography>
      <Typography color="#8C8C8C" mb={4}>
        Manage Your Account Settings
      </Typography>

      <Stack spacing={4}>
        {/* Update Profile Picture */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Update Profile Picture
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={userPhoto || avatarUrl}
              >
                U
              </Avatar>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={updatePhoto}
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: "#2294f2" }}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    <FontAwesomeIcon icon={faCamera} />
                  )
                }
                onClick={handleFileClick}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload New Picture"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Change Password */}
        <ChangePasswordCard />
      </Stack>
    </Box>
  );
}

export default Settings;

const ChangePasswordCard = () => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setShowPasswordFields((prev) => !prev);
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all fields.",
      });
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      Swal.fire({
        title: "Success",
        text: data.message,
        icon: "success",
      });

      // Optionally reset the form
      setOldPassword("");
      setNewPassword("");
      setShowPasswordFields(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Change Password
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#2294f2" }}
            startIcon={<FontAwesomeIcon icon={faLock} />}
            onClick={handleToggle}
          >
            Change Password
          </Button>

          <Collapse in={showPasswordFields}>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Old Password"
                type="password"
                fullWidth
                variant="outlined"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                onClick={handlePasswordChange}
                variant="contained"
                color="primary"
                sx={{ alignSelf: "flex-end" }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FontAwesomeIcon icon={faLock} />
                  )
                }
                disabled={loading}
              >
                {loading ? "Changing..." : "Change"}
              </Button>
            </Stack>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  );
};
