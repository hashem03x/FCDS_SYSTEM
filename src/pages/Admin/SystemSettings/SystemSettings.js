import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../utils/api";
import Swal from "sweetalert2";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    registrationOpen: false,
    profileUpdatesAllowed: false,
    passwordChangesAllowed: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { authToken } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/system-settings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch system settings",
      });
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/system-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "System settings updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update system settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.registrationOpen}
                  onChange={() => handleToggle("registrationOpen")}
                />
              }
              label="Allow New Registrations"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.profileUpdatesAllowed}
                  onChange={() => handleToggle("profileUpdatesAllowed")}
                />
              }
              label="Allow Profile Updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.passwordChangesAllowed}
                  onChange={() => handleToggle("passwordChangesAllowed")}
                />
              }
              label="Allow Password Changes"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemSettings;
