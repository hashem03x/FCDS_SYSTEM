import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Sidebar from "./Dashboard/Sidebar"; // Import the Sidebar

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const handleDrawerClose = () => {
    setOpen(false); // Close drawer when button is clicked
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar Drawer */}
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
