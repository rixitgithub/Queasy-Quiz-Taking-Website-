import React from "react";
import { useNavigate } from "react-router-dom";
import AppAppBar from "../components/AppAppBar";

import Divider from "@mui/material/Divider";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Tooltip,
  Switch,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { alpha } from "@mui/material";
import getLPTheme from "../getLPTheme";

const EndQuiz = () => {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState("light");
  const handleGoToDashboard = async () => {
    navigate("/dash");
  };

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
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
          <Typography variant="h4" sx={{ mb: 2 }}>
            Congratulations, you completed the quiz!
          </Typography>
          <Divider />
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoToDashboard}
            sx={{ position: "relative" }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EndQuiz;
