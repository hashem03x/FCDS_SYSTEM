import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDoctor } from '../../../context/DoctorContext';

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

const UploadGradesModal = ({ open, handleClose }) => {
  const [componentType, setComponentType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { courses } = useDoctor();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !componentType || !selectedCourse) {
      setError('Please fill in all fields and select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://college-system-two.vercel.app/api/gpa/upload/${componentType}/${selectedCourse}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload grades');
      }

      const data = await response.json();
      setSuccess(true);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to upload grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="upload-grades-modal"
    >
      <Box sx={style}>
        <Typography id="upload-grades-modal" variant="h6" component="h2" gutterBottom>
          Upload Grades
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grades Type</InputLabel>
            <Select
              value={componentType}
              label="Grades Type"
              onChange={(e) => setComponentType(e.target.value)}
            >
              <MenuItem value="midterm">Midterm</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="final">Final</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse}
              label="Course"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses?.map((course) => (
                <MenuItem key={course.code} value={course.code}>
                  {course.name} ({course.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="file"
            onChange={handleFileChange}
            sx={{ mb: 2 }}
            inputProps={{
              accept: '.xlsx,.xls,.csv'
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Grades uploaded successfully!
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

export default UploadGradesModal; 