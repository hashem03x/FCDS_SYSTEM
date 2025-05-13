import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Skeleton,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext"; // adjust path if needed
import { BASE_URL } from "../../../utils/api"; // make sure it's defined properly
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPen } from "@fortawesome/free-solid-svg-icons";
import zIndex from "@mui/material/styles/zIndex";
const initialFormState = {
  name: "",
  email: "",
  id: "",
  password: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  role: "student", // Default role
  status: "Active",
  department: "",
  yearOfStudy: 1,
  academicAdvisor: "",
};
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");

  const { authToken } = useAuth();

  const roles = ["student", "admin", "doctor", "teaching assistant"];

  const isStudent = formData.role === "student";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setUsers(data);
      } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${BASE_URL}/api/admin/delete-user/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        await fetchUsers();
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleOpenForm = (user = null) => {
    setEditingUser(user);
    setFormData(user ? { ...user, password: "" } : { ...initialFormState });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const resetForm = () => {
    setFormData({ ...initialFormState });
  };

  const validateFormData = () => {
    if (formData.password.length < 8) {
      Swal.fire({
        title: "Error!",
        text: "Password must be at least 8 characters long.",
        icon: "error",
        position: "top-Right", // Ensure SweetAlert appears at the top of the screen
      });
      return false;
    } else {
      return true;
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    // First validate form data
    if (!validateFormData()) return;
    try {
      const response = await fetch(
        "https://college-system-two.vercel.app/api/admin/add-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Add your token here
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "User added successfully.",
          icon: "success",
          position: "center", // Ensure SweetAlert appears at the top of the screen
        });
        resetForm(); // Reset form after success
        setOpen(false); // Close the dialog
        await fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to add user: ${data.message}`,
          icon: "error",
          position: "top-center", // Ensure SweetAlert appears at the top of the screen
        });
        resetForm(); // Reset form after success
        setOpen(false); // Close the dialog
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        position: "top-center", // Ensure SweetAlert appears at the top of the screen
      });
      resetForm(); // Reset form after success
      setOpen(false); // Close the dialog
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/update-user/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "User updated successfully.",
          icon: "success",
          position: "center",
        });
        resetForm();
        setOpen(false);
        await fetchUsers();
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to update user: ${data.message}`,
          icon: "error",
          position: "top-center",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        position: "top-center",
      });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => handleOpenForm()}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>
      <TextField
        label="Search by Name or ID"
        variant="outlined"
        size="small"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TableContainer sx={{ overflowX: "scroll" }} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Level</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from(new Array(5)).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width="40px" />
                    </TableCell>
                  </TableRow>
                ))
              : users
                  .filter(
                    (user) =>
                      user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      user.id?.includes(searchTerm)
                  )
                  .map((user, index) => ( 
                    <TableRow key={index}>
                      <TableCell>{user?.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.role === "student"
                          ? user?.performance?.academicLevel
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenForm(user)}>
                          <FontAwesomeIcon icon={faUserPen} />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <TextField
            label="ID"
            fullWidth
            margin="dense"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="dense"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            inputProps={{
              max: new Date().toISOString().split("T")[0], // restrict to today or before
            }}
          />

          <TextField
            label="Gender"
            fullWidth
            margin="dense"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          />
          <TextField
            label="Address"
            fullWidth
            margin="dense"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <TextField
            select
            label="Role"
            fullWidth
            margin="dense"
            SelectProps={{ native: true }}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </TextField>

          {isStudent && (
            <>
              <TextField
                label="Status"
                fullWidth
                margin="dense"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              />
              <TextField
                label="Department"
                fullWidth
                margin="dense"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
              <TextField
                label="Year of Study"
                type="number"
                fullWidth
                margin="dense"
                value={formData.yearOfStudy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearOfStudy: parseInt(e.target.value),
                  })
                }
              />
              <TextField
                label="Academic Advisor"
                fullWidth
                margin="dense"
                value={formData.academicAdvisor}
                onChange={(e) =>
                  setFormData({ ...formData, academicAdvisor: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
            {editingUser ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;
