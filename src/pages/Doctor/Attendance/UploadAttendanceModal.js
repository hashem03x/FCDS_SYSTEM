import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const UploadAttendanceModal = ({ open, handleClose, courseCode, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://college-system-two.vercel.app/api/attendence/upload/course/${courseCode}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload attendance');
      }

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        throw new Error(data.message || 'Failed to upload attendance');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="upload-attendance-modal"
    >
      <Box sx={style}>
        <Typography id="upload-attendance-modal" variant="h6" component="h2" gutterBottom>
          Upload Attendance Sheet
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="file"
            onChange={handleFileChange}
            sx={{ mb: 2 }}
            inputProps={{
              accept: '.xlsx,.xls'
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Upload
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default UploadAttendanceModal; 