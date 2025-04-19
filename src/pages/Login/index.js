import {
  Checkbox,
  FormControlLabel,
  Grid2,
  TextField,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "./login.css";
import logo from "../../assets/images/logo.png";
import login_bg_shapes from "../../assets/images/login_bg_shapes.png";
import login_image from "../../assets/images/login_image.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
function Login() {
  const navigate = useNavigate();
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const { login, isLoading } = useAuth();
  useEffect(() => {
    ID !== "" && password !== "" ? setIsDisabled(false) : setIsDisabled(true);
  }, [password, ID]);

  return (
    <div style={{ height: "100vh" }}>
      <Grid2
        sx={{ height: "100%", position: "relative" }}
        container
        spacing={2}
      >
        <Grid2
          size={6}
          sx={{
            position: "relative",
            backgroundColor: "rgba(131, 184, 253, 1)",
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
              opacity: 0.2, // Adjust opacity here
              zIndex: 1,
            },
          }}
        >
          <div style={{ zIndex: 2, position: "relative" }}>
            <img
              src={logo}
              alt="Alexu Logo"
              className="img-fluid"
              width={180}
            />
          </div>
          <div
            className="position-absolute"
            style={{
              zIndex: 2,
              left: "50%",
              top: "50%",
              transform: "translate(-50% , -50%)",
            }}
          >
            <img src={login_image} alt="Login Image" width={500} height={500} />
          </div>
        </Grid2>
        <Grid2 size={6} sx={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50% , -50%)",
              width: "50%",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "30px", fontWeight: "bold" }}>
                Account Login
              </p>
            </div>
            <div className="d-flex flex-column">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                fullWidth
                className="mt-3"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={false}
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
                sx={{ backgroundColor: "rgba(131, 184, 253, 1)" }}
                className="mt-4"
                disabled={isDisabled}
                loading={isLoading}
                loadingPosition="end"
              >
                Login
              </Button>
            </div>
          </div>
        </Grid2>
      </Grid2>
    </div>
  );
}

export default Login;
