import React, { useState } from "react";
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
  ButtonGroup,
  Stack,
  Tooltip,
  MenuItem,
  Grid,
} from "@mui/material";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { useAdmin } from "../../../context/AdminContext";
import { BASE_URL } from "../../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const initialFormState = {
  name: "",
  email: "",
  id: "",
  password: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  role: "student",
  status: "Active",
  department: "",
  yearOfStudy: 1,
  academicAdvisor: "",
};

function Users() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const { authToken } = useAuth();
  const { users, loading, refreshUsers } = useAdmin();
  const navigate = useNavigate();

  const roles = ["student", "admin", "doctor", "ta"];
  const isStudent = formData.role === "student";

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
        await refreshUsers();
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error!", "Failed to delete user.", "error");
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
    if (!editingUser && formData.password.length < 8) {
      Swal.fire({
        title: "Error!",
        text: "Password must be at least 8 characters long.",
        icon: "error",
        position: "top-Right",
      });
      return false;
    }
    return true;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateFormData()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/admin/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "User added successfully.",
          icon: "success",
          position: "center",
        });
        resetForm();
        setOpen(false);
        await refreshUsers();
      } else {
        const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed to add user: ${data.message}`,
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
        await refreshUsers();
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id?.includes(searchTerm);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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

      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="contained" aria-label="role filter buttons">
          <Button 
            onClick={() => setSelectedRole("all")}
            color={selectedRole === "all" ? "primary" : "inherit"}
          >
            All
          </Button>
          <Button 
            onClick={() => setSelectedRole("doctor")}
            color={selectedRole === "doctor" ? "primary" : "inherit"}
          >
            Doctors
          </Button>
          <Button 
            onClick={() => setSelectedRole("ta")}
            color={selectedRole === "ta" ? "primary" : "inherit"}
          >
            TAs
          </Button>
          <Button 
            onClick={() => setSelectedRole("student")}
            color={selectedRole === "student" ? "primary" : "inherit"}
          >
            Students
          </Button>
        </ButtonGroup>
      </Box>

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
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                  <TableCell align="right"><Skeleton width="80px" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(user)}
                          color="primary"
                        >
                          <FontAwesomeIcon icon={faUserPen} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          color="error"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  helperText={editingUser ? "Leave blank to keep current password" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              {isStudent && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Year of Study"
                      name="yearOfStudy"
                      type="number"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      inputProps={{ min: 1, max: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Academic Advisor"
                      name="academicAdvisor"
                      value={formData.academicAdvisor}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={editingUser ? handleUpdateUser : handleAddUser}
            variant="contained"
            color="primary"
          >
            {editingUser ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;
