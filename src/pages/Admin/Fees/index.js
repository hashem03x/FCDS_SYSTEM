import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";

const statusOptions = ["Pending", "Paid", "Overdue"]; // Student fee status options
const academicLevels = ["First", "Second", "Third", "Fourth"];
const departments = [
  "Administration",
  "Computing and Data Science",
  "Intelligent Systems",
  "Cybersecurity",
  "Business Analytics",
  "Media Analytics",
  "Healthcare Informatics and Data Analytics"
];

// Function to generate feeID
const generateFeeId = (academicLevel, department) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get first letter of each word in department
  const deptCode = department
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  // Get number from academic level (First -> 1, Second -> 2, etc.)
  const levelCode = academicLevel === "First" ? "1" :
                   academicLevel === "Second" ? "2" :
                   academicLevel === "Third" ? "3" : "4";
  
  return `FEE-${deptCode}-${levelCode}-${year}${month}${day}`;
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFee, setNewFee] = useState({
    feeId: "",
    academicLevel: "",
    department: "",
    amount: 0,
    dueDate: "",
  });
  const { authToken } = useAuth();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch fees data
  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/fees/get-all-fees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      setFees(data);
    } catch (err) {
      console.error("Error fetching fees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [authToken]);

  // Handle adding a fee
  const handleSaveFee = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/api/fees/add-fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newFee),
      });

      const data = await response.json();
      if (response.ok) {
        setFees((prev) => [...prev, data]);
        setOpenDialog(false);
        Swal.fire({
          title: "Success!",
          text: data.message || "Fee added successfully",
          icon: "success",
          confirmButtonColor: "#2F748F",
        });
      } else {
        throw new Error(data.message || "Failed to add fee");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#2F748F",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle removing a fee
  const handleDeleteFee = async (id) => {
    const response = await fetch(`${BASE_URL}/api/fees/delete-fee/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.ok) {
      setFees((prev) => prev.filter((fee) => fee._id !== id));
      fetchFees();
    }
  };

  // Open dialog for adding a fee
  const openFeeDialog = () => {
    setNewFee({
      feeId: "",
      academicLevel: "",
      department: "",
      amount: 0,
      dueDate: "",
    });
    setOpenDialog(true);
  };

  // Handle academic level or department change
  const handleLevelOrDeptChange = (field, value) => {
    const updatedFee = { ...newFee, [field]: value };
    if (field === 'academicLevel' || field === 'department') {
      if (updatedFee.academicLevel && updatedFee.department) {
        updatedFee.feeId = generateFeeId(updatedFee.academicLevel, updatedFee.department);
      }
    }
    setNewFee(updatedFee);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Student Fees
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={openFeeDialog}
            sx={{ mb: 2 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Fee
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fee ID</TableCell>
                  <TableCell>Academic Level</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell>{fee.feeId}</TableCell>
                    <TableCell>{fee.academicLevel}</TableCell>
                    <TableCell>{fee.department}</TableCell>
                    <TableCell>{fee.amount}</TableCell>
                    <TableCell>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteFee(fee.feeId)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Fee</DialogTitle>
        <DialogContent>
          <TextField
            label="Fee ID"
            fullWidth
            value={newFee.feeId}
            disabled
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Academic Level</InputLabel>
            <Select
              value={newFee.academicLevel}
              label="Academic Level"
              onChange={(e) => handleLevelOrDeptChange('academicLevel', e.target.value)}
            >
              {academicLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={newFee.department}
              label="Department"
              onChange={(e) => handleLevelOrDeptChange('department', e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Amount"
            fullWidth
            value={newFee.amount}
            onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
            sx={{ mb: 2 }}
            type="number"
          />
          <TextField
            label="Due Date"
            fullWidth
            type="date"
            value={newFee.dueDate}
            onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: today
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary" disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveFee} 
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
