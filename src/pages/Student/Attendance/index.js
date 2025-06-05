import React, { useRef, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import Webcam from "react-webcam";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";

const Attendance = () => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user } = useAuth();
  console.log("user", user);
  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "user",
  };

  useEffect(() => {
    // Automatically start capturing 3s after mount
    const timer = setTimeout(() => {
      captureImage();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const captureImage = async () => {
    if (!webcamRef?.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      Swal.fire({
        icon: "error",
        title: "Capture Failed",
        text: "Could not capture image.",
      });
      return;
    }

    setCapturing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");

      const res = await fetch("http://127.0.0.1:5000/recognize", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");

      if (res.ok || res.status === 200) {
        if (res.status === 400) {
          Swal.fire({
            icon: "error",
            title: "Face Not Found",
            text: "Please ensure your face is clearly visible in the frame.",
          });
        }
      }

      if (res.status === 400) {
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "No face Detected",
          text: `Please ensure your face is clearly visible in the frame.`,
        });
        return;
      }

      const data = await res.json();
      setResponse(data);

      // ✅ Success alert
      console.log("NAME", user?.name);
      if (data?.label !== "unknown" && data?.confidence >= 0.95) {
        Swal.fire({
          icon: "success",
          title: "Verification Successful",
          text: `${data?.message}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Unrecognized Face",
          text: "Please try again or contact college admin if you belive it's a mistake.",
        });
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Attendance System
      </Typography>
      <Card elevation={4} sx={{ p: 2 }}>
        <CardContent>
          <div
            style={{
              position: "relative",
              width: 480,
              height: 360,
              margin: "auto",
            }}
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
            />

            {/* Face placement canvas overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: 10,
                backgroundColor: "rgba(0,0,0,0.4)",
                boxSizing: "border-box",
                pointerEvents: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Transparent face window */}
              <div
                style={{
                  width: 200,
                  height: 260,
                  border: "2px dashed #fff",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0)",
                }}
              ></div>
            </div>
          </div>

          {capturing ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={captureImage}
            >
              Retry Capture
            </Button>
          )}
        </CardContent>
      </Card>

      {/* {response && (
        <Alert sx={{ mt: 3 }} severity="success">
          {`Welcome, ${response.label} (Confidence: ${(
            response.confidence * 100
          ).toFixed(2)}%)`}
        </Alert>
      )} */}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        {error ? (
          <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
            {error}
          </Alert>
        ) : null}
      </Snackbar>
    </Container>
  );
};

export default Attendance;

export async function encryptNumber(number, keyString) {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(number.toString());
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyString),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // Combine iv + ciphertext
  const encryptedBytes = new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);

  return btoa(String.fromCharCode(...encryptedBytes));
}


