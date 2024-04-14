import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  CssBaseline,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import Footer from "../components/Footer";
import Chart from "react-apexcharts";
import { useParams } from "react-router-dom";

export default function UserAnalysis() {
  const [mode, setMode] = useState("light");
  const { uniqueCode } = useParams();
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const [marksDistribution, setMarksDistribution] = useState({
    options: {
      chart: {
        id: "marks-distribution-chart",
        type: "donut",
      },
      labels: ["Correct Answers", "Incorrect Answers", "Unattempted Questions"],
      colors: ["#7cb5ec", "#f15c80", "#808080"],
    },
    series: [0, 0, 0],
  });

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("this is unique", uniqueCode);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/questionnum`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch analysis data");
        }
        const data = await response.json();
        setMarksDistribution({
          ...marksDistribution,
          series: [
            data.correctCount,
            data.incorrectCount,
            data.unattemptedCount,
          ],
        });
      } catch (error) {
        console.error("Error fetching analysis data:", error);
      }
    };

    fetchData();
  }, [uniqueCode]);

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
            pt: { xs: 5, sm: 12 },
            pb: { xs: 8, sm: 12 },
          }}
          style={{ width: "110%" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "95%",
              marginTop: { xs: 20, sm: 20 },
            }}
          >
            <Box
              sx={{
                width: "50%",
                marginRight: "10px",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: mode === "light" ? "#000000" : "#FFFFFF",
                }}
              >
                Question Analysis
              </Typography>
              <Chart
                options={marksDistribution.options}
                series={marksDistribution.series}
                type="donut"
                width="100%"
              />
            </Box>

            <Box
              sx={{
                width: "50%",
                marginLeft: "10px",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
                maxHeight: "450px",
                overflowY: "auto",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: mode === "light" ? "#000000" : "#FFFFFF",
                }}
              >
                Quiz Feedback
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: mode === "light" ? "#000000" : "#FFFFFF" }}
              ></Typography>
            </Box>
          </Box>
          <Divider />
          <Footer />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
