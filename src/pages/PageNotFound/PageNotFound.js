import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug } from "@fortawesome/free-solid-svg-icons";
const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f9f9f9"
      textAlign="center"
      px={2}
    >
      <FontAwesomeIcon fontSize="42px" className="mb-4" icon={faBug} />
      <Typography variant="h3" color="textPrimary" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Oops! Looks like the page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ textTransform: "none", px: 4, py: 1 }}
      >
        Go to Homepage
      </Button>
    </Box>
  );
};

export default PageNotFound;
