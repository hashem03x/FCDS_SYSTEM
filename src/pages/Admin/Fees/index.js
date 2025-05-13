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
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

const statusOptions = ["Pending", "Paid", "Overdue"]; // Student fee status options

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFee, setNewFee] = useState({
    feeId: "",
    academicLevel: "",
    yearOfStudy: 1,
    department: "",
    amount: 0,
    dueDate: "",
  });
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const { authToken } = useAuth();

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

  // Handle adding or updating a fee
  const handleSaveFee = async () => {
    if (selectedFeeId) {
      // Update existing fee
      const response = await fetch(
        `${BASE_URL}/api/fee/update-fee/${selectedFeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(newFee),
        }
      );

      if (response.ok) {
        setFees((prev) =>
          prev.map((fee) =>
            fee._id === selectedFeeId ? { ...fee, ...newFee } : fee
          )
        );
        setOpenDialog(false);
      }
    } else {
      // Add new fee
      const response = await fetch(`${BASE_URL}/api/fee/add-fee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newFee),
      });

      if (response.ok) {
        const data = await response.json();
        setFees((prev) => [...prev, data]);
        setOpenDialog(false);
      }
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

  // Open dialog for adding or editing a fee
  const openFeeDialog = (fee = null) => {
    if (fee) {
      setNewFee({
        feeId: fee.feeId,
        academicLevel: fee.academicLevel,
        yearOfStudy: fee.yearOfStudy,
        department: fee.department,
        amount: fee.amount,
        dueDate: fee.dueDate,
      });
      setSelectedFeeId(fee._id);
    } else {
      setNewFee({
        feeId: "",
        academicLevel: "",
        yearOfStudy: 1,
        department: "",
        amount: 0,
        dueDate: "",
      });
      setSelectedFeeId(null);
    }
    setOpenDialog(true);
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
            onClick={() => openFeeDialog()}
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
                      <IconButton onClick={() => openFeeDialog(fee)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </IconButton>
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
        <DialogTitle>{selectedFeeId ? "Edit Fee" : "Add Fee"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Fee ID"
            fullWidth
            value={newFee.feeId}
            onChange={(e) =>
              setNewFee({ ...newFee, feeId: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Academic Level"
            fullWidth
            value={newFee.academicLevel}
            onChange={(e) =>
              setNewFee({ ...newFee, academicLevel: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Year of Study"
            fullWidth
            type="number"
            value={newFee.yearOfStudy}
            onChange={(e) =>
              setNewFee({ ...newFee, yearOfStudy: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Department"
            fullWidth
            value={newFee.department}
            onChange={(e) =>
              setNewFee({ ...newFee, department: e.target.value })
            }
            sx={{ mb: 2 }}
          />
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveFee} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
