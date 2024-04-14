import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  CssBaseline,
  Divider,
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
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: "{value}", // Display numbers instead of percentages
          },
        },
      },
    },
    series: [0, 0, 0],
  });
  const [radialBarData, setRadialBarData] = useState({
    options: {
      chart: {
        height: 280,
        type: "radialBar",
      },
      series: [0, 0, 0],
      plotOptions: {
        radialBar: {
          dataLabels: {
            total: {
              show: false,
              label: "Marks",
              formatter: function (val) {
                return parseFloat(val).toFixed(1); // Display one decimal place
              },
            },
          },
        },
      },
      labels: ["Highest Score", "Average Score", "Your Score"],
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val) {
            return parseFloat(val).toFixed(1); // Display one decimal place
          },
        },
      },
      center: {
        text: "", // Set the center text to an empty string
      },
    },
    series: [0, 0, 0],
  });

  const [totalQuizMarks, setTotalQuizMarks] = useState(0); // State to store total marks of the quiz
  const [averageMarks, setAverageMarks] = useState(0); // State to store average marks
  const [userData, setUserData] = useState(0); // State to store user data

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch question analysis data
        const questionAnalysisResponse = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/questionnum`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!questionAnalysisResponse.ok) {
          throw new Error("Failed to fetch question analysis data");
        }
        const questionAnalysisData = await questionAnalysisResponse.json();
        setMarksDistribution({
          ...marksDistribution,
          series: [
            questionAnalysisData.correctCount,
            questionAnalysisData.incorrectCount,
            questionAnalysisData.unattemptedCount,
          ],
        });

        // Fetch score data
        const scoreResponse = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/score`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!scoreResponse.ok) {
          throw new Error("Failed to fetch score data");
        }
        const scoreData = await scoreResponse.json();
        const highestPercentage =
          (scoreData.highestMarks / scoreData.totalQuizMarks) * 100;
        const averagePercentage =
          (scoreData.averageMarks / scoreData.totalQuizMarks) * 100;
        const userPercentage =
          (scoreData.userMarks.totalMarks / scoreData.totalQuizMarks) * 100;
        setRadialBarData({
          ...radialBarData,
          series: [highestPercentage, averagePercentage, userPercentage],
        });

        // Set total quiz marks
        setTotalQuizMarks(scoreData.totalQuizMarks);

        // Set average marks
        setAverageMarks(scoreData.averageMarks);

        // Set user data
        setUserData(scoreData.userMarks.totalMarks);
      } catch (error) {
        console.error("Error fetching data:", error);
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
                Score Analysis
              </Typography>
              <Chart
                options={radialBarData.options}
                series={radialBarData.series}
                type="radialBar"
                height={280}
              />
              <Typography
                variant="subtitle1"
                sx={{
                  color: mode === "light" ? "#000000" : "#FFFFFF",
                  marginTop: "10px",
                }}
              >
                Your Marks: {userData.toFixed(2)}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Footer />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
