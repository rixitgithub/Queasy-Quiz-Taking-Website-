import * as React from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
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

export default function SignIn() {
  const [mode, setMode] = React.useState("light");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = () => {
    const userData = {
      email: email,
      password: password,
    };

    fetch("http://localhost:1234/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (res.status === 404) {
          throw new Error("Email not found");
        } else if (res.status === 401) {
          throw new Error("Password incorrect");
        } else if (!res.ok) {
          throw new Error("An error occurred");
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        console.log(data);
        navigate("/dash");
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
              width: { xs: "90%", sm: "50%" }, // Adjust width for smaller screens
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Center align child elements
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              SIGN IN
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Container sx={{ mb: 2, width: "100%" }}>
              <TextField
                id="email"
                label="Email Address"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  width: "100%", // Set width to 100% of parent container
                  maxWidth: "100%", // Ensure text field doesn't exceed parent width
                  minWidth: 0, // Reset the default min-width
                  "@media (max-width: 400px)": {
                    minWidth: 5,
                  },
                }}
              />
              <TextField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 2,
                  width: "100%", // Set width to 100% of parent container
                  maxWidth: "100%", // Ensure text field doesn't exceed parent width
                  minWidth: 0, // Reset the default min-width
                  "@media (max-width: 400px)": {
                    minWidth: 5,
                  },
                }}
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
            <Button variant="contained" color="primary" onClick={handleSignIn}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
