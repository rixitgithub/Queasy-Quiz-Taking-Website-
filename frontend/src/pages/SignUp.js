import * as React from "react";
import {
  Button,
  Container,
  Typography,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { alpha } from "@mui/material";

export default function SignUp() {
  const [mode, setMode] = React.useState("light");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = () => {
    if (!fname || !lname || !email || !password) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    const userData = {
      fname: fname,
      lname: lname,
      email: email,
      password: password,
    };

    fetch("http://localhost:1234/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Email already exists");
        }
        return res.json();
      })
      .then((data) => {
        navigate("/signin");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <ThemeProvider theme={createTheme(getLPTheme("light"))}>
      <Box
        id="hero"
        sx={(theme) => ({
          width: "100%",
          backgroundImage:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #CEE5FD, #FFF)"
              : `linear-gradient(#02294F, ${alpha("#090E10", 0.0)})`,
          backgroundSize: "100% 20%",
          backgroundRepeat: "no-repeat",
        })}
      >
        <CssBaseline />
        <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            pt: { xs: 14, sm: 20 },
            pb: { xs: 8, sm: 12 },
          }}
        >
          <Box
            sx={{
              mt: { xs: 1, sm: 3 },
              alignSelf: "center",
              width: "50%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              REGISTER NOW
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Container sx={{ mb: 2 }}>
              <TextField
                id="fname"
                label="First Name"
                variant="outlined"
                size="small"
                fullWidth
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                id="lname"
                label="Last Name"
                variant="outlined"
                size="small"
                fullWidth
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                id="email"
                label="Email Address"
                variant="outlined"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                size="small"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Container>
            {error && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Button variant="contained" color="primary" onClick={handleSignUp}>
              Register
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
