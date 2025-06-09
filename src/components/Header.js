import React, { useMemo } from "react";
import fcds from "../assets/images/FCDS.png";
import { useAuth } from "../context/AuthContext";
import { Typography } from "@mui/material";

// Memoized styles
const headerStyles = {
  header: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    height: "112px",
    boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  logo: {
    width: "165px",
    height: "125px",
  },
};

// Memoized dashboard titles
const dashboardTitles = {
  admin: "FCDS Admin Dashboard",
  student: "FCDS Student Dashboard",
  doctor: "FCDS Doctor Dashboard",
};

const Header = React.memo(() => {
  const { userRole } = useAuth();

  // Memoize the dashboard title
  const dashboardTitle = useMemo(() => {
    return dashboardTitles[userRole] || "";
  }, [userRole]);

  return (
    <header
      className="d-flex align-items-center"
      style={headerStyles.header}
    >
      <div className="container d-flex align-items-center">
        <div>
          <img
            className="navbar-brand"
            src={fcds}
            style={headerStyles.logo}
            alt="FCDS Logo"
          />
        </div>
        <Typography variant="h5">
          {dashboardTitle}
        </Typography>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
