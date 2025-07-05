import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/logos/logo.png";
import logo from "assets/images/logos/logo.png";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const BASE_URL = "https://laundry-app.synoventum.site";

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbarMessage("OTP sent successfully");
        setSnackbarSeverity("success");
        setStep(2);
      } else {
        setSnackbarMessage(data.message || "Failed to send OTP");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Something went wrong");
      setSnackbarSeverity("error");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("id", String(data.admin.id));
        localStorage.setItem("email", data.admin.email);
        localStorage.setItem("name", data.admin.name);

        setSnackbarMessage("Login successful");
        setSnackbarSeverity("success");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setSnackbarMessage(data.message || "OTP verification failed");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Something went wrong");
      setSnackbarSeverity("error");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) handleSendOTP();
    else if (step === 2) handleVerifyOTP();
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          borderRadius="lg"
          mx={2}
          mt={1}
          p={3}
          mb={1}
          textAlign="center"
          sx={{
            backgroundColor: "#E8F5E9",
            boxShadow: "0px 4px 20px rgba(76, 175, 80, 0.3)",
          }}
        >
          <MDBox mb={5}>
            <img src={logo} alt="Logo" style={{ maxWidth: "100px", marginBottom: "5px" }} />
          </MDBox>
          <MDTypography variant="h4" fontWeight="medium" color="dark" mt={1}>
            Admin Login
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Mobile Number"
                fullWidth
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </MDBox>
            {step === 2 && (
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="OTP"
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </MDBox>
            )}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={() => setRememberMe(!rememberMe)}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                fullWidth
                type="submit"
                disabled={isLoading}
                sx={{
                  backgroundColor: "#66BB6A",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#4CAF50" },
                }}
              >
                {isLoading
                  ? "Please wait..."
                  : step === 1
                  ? "Send OTP"
                  : "Verify OTP & Login"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </BasicLayout>
  );
}

export default Basic;


