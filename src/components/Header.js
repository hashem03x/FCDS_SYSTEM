import React from "react";
import fcds from "../assets/images/FCDS.png";
import { useAuth } from "../context/AuthContext";
import { Typography } from "@mui/material";
function Header() {
  const { userRole } = useAuth();

  return (
    <header
      className=" d-flex align-items-center"
      style={{
        backgroundColor: "rgba(255, 255, 255, 1)",
        height: "112px",
        boxShadow: " 0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
    >
      <div className="container d-flex align-items-center">
        <div>
          <img
            className="navbar-brand"
            src={fcds}
            style={{ width: "165px", height: "125px" }}
          />
        </div>
        <Typography variant="h5">
          {userRole === "admin" && "FCDS Admin Dashboard"}
          {userRole === "student" && "FCDS Student Dashboard"}
          {userRole === "doctor" && "FCDS Doctor Dashboard"}
        </Typography>
      </div>
    </header>
  );
}

export default Header;
