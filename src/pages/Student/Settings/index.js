import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { faCamera, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";

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
              <Avatar sx={{ width: 80, height: 80 }} src={userPhoto || avatarUrl}>
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
                sx={{ backgroundColor: "#DE8811" }}
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
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#DE8811" }}
                startIcon={<FontAwesomeIcon icon={faLock} />}
              >
                Change Password
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default Settings;
