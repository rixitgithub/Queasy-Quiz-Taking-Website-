import * as React from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";

export default function SignIn() {
  const [mode, setMode] = React.useState("light");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <ThemeProvider theme={createTheme(getLPTheme("light"))}>
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
            SIGN IN
          </Typography>

          <Divider sx={{ mb: 2 }} />
          <Container sx={{ mb: 2 }}>
            <TextField
              id="email"
              label="Email Address"
              size="small"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
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
    </ThemeProvider>
  );
}
