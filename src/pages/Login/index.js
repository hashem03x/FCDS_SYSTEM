import {
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "./login.css";
import logo from "../../assets/images/logo.png";
import login_bg_shapes from "../../assets/images/login_bg_shapes.png";
import login_image from "../../assets/images/login_image.png";
import { useAuth } from "../../context/AuthContext.js";
import { CircularProgress } from "@mui/material";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Login() {
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  useEffect(() => {
    setIsDisabled(!(ID && password));
  }, [password, ID]);

  return (
    <div style={{ height: "100vh" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* Left Side (Image + Branding) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            position: "relative",
            backgroundColor: "rgba(131, 184, 253, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${login_bg_shapes})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.2,
              zIndex: 1,
            },
          }}
        >
          <div
            style={{
              zIndex: 2,
              position: "relative",
              maxWidth: "100%",
              width: "90%",
              marginTop: "30px",
            }}
          >
            <img
              src={login_image}
              alt="Login Illustration"
              style={{ width: "100%", height: "auto", maxWidth: "500px" }}
            />
          </div>
        </Grid>

        {/* Right Side (Login Form) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 4, md: 0 },
          }}
        >
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div
              style={{
                position: "absolute",
                zIndex: 2,
                top: "20px",
                right: "20px",
              }}
            >
              <img src={logo} alt="Alexu Logo" width={180} />
            </div>
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                Account Login
              </p>
            </div>
            <div>
              <TextField
                id="id"
                label="ID"
                value={ID}
                onChange={(e) => setID(e.target.value)}
                variant="outlined"
                fullWidth
                className="mt-3"
              />
              <TextField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                fullWidth
                className="mt-3"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      height: "20px",
                      color: "rgba(222, 136, 17, 1)",
                      "&.Mui-checked": {
                        color: "rgba(222, 136, 17, 1)",
                      },
                    }}
                  />
                }
                label="Remember me"
                className="mt-3"
              />
              <Button
                onClick={() => login(ID, password)}
                variant="contained"
                fullWidth
                sx={{ backgroundColor: "rgba(131, 184, 253, 1)" }}
                className="mt-4"
                disabled={isDisabled || isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit"/>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Login;
