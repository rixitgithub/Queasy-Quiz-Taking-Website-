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
  const [additionalChartData, setAdditionalChartData] = useState({
    options: {
      chart: {
        id: "additional-stats-chart",
        type: "line",
      },
      xaxis: {
        categories: [],
        labels: {
          offsetY: 10, // Adjust label position lower
        },
      },
      yaxis: {
        title: {
          text: "Marks",
        },
        labels: {
          formatter: function (val) {
            return val.toFixed(1); // Format values to single decimal point
          },
        },
      },
      plotOptions: {
        line: {
          markers: {
            size: 0,
          },
        },
      },
      colors: [
        "#FFCC80", // Light orange
        "#FFE082", // Light yellow
        "#FF69B4", // Light pink
      ],
    },
    series: [
      {
        name: "Highest Marks",
        type: "line",
        data: [],
      },
      {
        name: "Average Marks",
        type: "line",
        data: [],
      },
      {
        name: "Your Marks",
        type: "line",
        data: [], // User marks data
      },
    ],
  });

  const [totalQuizMarks, setTotalQuizMarks] = useState(0); // State to store total marks of the quiz
  const [averageMarks, setAverageMarks] = useState(0); // State to store average marks
  const [userData, setUserData] = useState(0); // State to store user data

  const [timeDistribution, setTimeDistribution] = useState({
    options: {
      chart: {
        id: "time-distribution-chart",
        type: "area",
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "category",
      },
      yaxis: {
        title: {
          text: "Time (seconds)",
        },
      },
    },
    series: [],
  });

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const marksResponse = await fetch(
          `http://localhost:1234/marks-stats/${uniqueCode}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const marksData = await marksResponse.json();
        if (!marksResponse.ok || marksData.length === 0) {
          throw new Error("Failed to fetch marks data");
        }

        // Additional Chart Data
        const uniqueQuestions = Array.from(
          new Set(marksData.map((mark) => mark.questionText))
        );
        const additionalChartData = {
          options: {
            chart: {
              id: "additional-stats-chart",
              type: "line",
            },
            xaxis: {
              categories: uniqueQuestions,
              labels: {
                offsetY: 10, // Adjust label position lower
              },
            },
            yaxis: {
              title: {
                text: "Marks",
              },
              labels: {
                formatter: function (val) {
                  return val.toFixed(1); // Format values to single decimal point
                },
              },
            },
            plotOptions: {
              line: {
                markers: {
                  size: 0,
                },
              },
            },
          },
          series: [
            {
              name: "Highest Marks",
              type: "line",
              data: uniqueQuestions.map((question) => {
                const highestMark = Math.max(
                  ...marksData
                    .filter((mark) => mark.questionText === question)
                    .map((mark) => mark.highestMarks)
                );
                return highestMark;
              }),
            },
            {
              name: "Average Marks",
              type: "line",
              data: uniqueQuestions.map((question) => {
                const averageMark = marksData
                  .filter((mark) => mark.questionText === question)
                  .map((mark) => mark.averageMarks);
                return averageMark;
              }),
            },
            {
              name: "Your Marks",
              type: "line",
              data: uniqueQuestions.map((question) => {
                const userMark = marksData
                  .filter((mark) => mark.questionText === question)
                  .map((mark) => mark.userMarks); // Assuming user marks are provided in the backend response
                return userMark;
              }),
            },
          ],
        };

        setAdditionalChartData(additionalChartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchTimeDistribution = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/time-distribution`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch time distribution data");
        }
        const timeDistributionData = await response.json();

        // Extract unique question texts
        const uniqueQuestions = {};
        timeDistributionData.forEach((data) => {
          if (!uniqueQuestions[data.questionText]) {
            uniqueQuestions[data.questionText] = {
              averageTime: data.averageTimeSpent,
              userTime: data.userTimeSpent,
            };
          }
        });

        // Generate categories and series based on unique questions
        const categories = Object.keys(uniqueQuestions);
        const series = [
          {
            name: "Average Time",
            data: categories.map(
              (question) => uniqueQuestions[question].averageTime
            ),
          },
          {
            name: "User Time",
            data: categories.map(
              (question) => uniqueQuestions[question].userTime
            ),
          },
        ];

        setTimeDistribution({
          options: {
            ...timeDistribution.options,
            xaxis: {
              categories,
              labels: {
                formatter: function (val) {
                  // Label the x-axis with question text
                  return categories[val];
                },
              },
            },
          },
          series,
        });
      } catch (error) {
        console.error("Error fetching time distribution data:", error);
      }
    };

    fetchTimeDistribution();
  }, [uniqueCode]);

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

    const fetchTimeDistribution = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/time-distribution`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch time distribution data");
        }
        const timeDistributionData = await response.json();

        // Extract unique question texts
        const uniqueQuestions = {};
        timeDistributionData.forEach((data) => {
          if (!uniqueQuestions[data.questionText]) {
            uniqueQuestions[data.questionText] = {
              averageTime: data.averageTimeSpent,
              userTime: data.userTimeSpent,
            };
          }
        });

        // Generate categories and series based on unique questions
        const categories = Object.keys(uniqueQuestions);
        const series = [
          {
            name: "Average Time",
            data: categories.map(
              (question) => uniqueQuestions[question].averageTime
            ),
          },
          {
            name: "User Time",
            data: categories.map(
              (question) => uniqueQuestions[question].userTime
            ),
          },
        ];

        setTimeDistribution({
          options: {
            ...timeDistribution.options,
            xaxis: {
              categories, // Set categories as question texts
              labels: {
                formatter: function (val) {
                  // Label the x-axis with question text
                  return categories[val];
                },
              },
            },
          },
          series,
        });
      } catch (error) {
        console.error("Error fetching time distribution data:", error);
      }
    };

    fetchData();
    fetchTimeDistribution();
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
                Your Marks: {userData.toFixed(2)} / {totalQuizMarks.toFixed(2)}
              </Typography>
            </Box>
          </Box>
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
                Time Distribution
              </Typography>
              <Chart
                options={{
                  ...timeDistribution.options,
                  xaxis: {
                    ...timeDistribution.options.xaxis,
                    labels: {
                      ...timeDistribution.options.xaxis.labels,
                      formatter: function (val) {
                        console.log("data check", timeDistribution.series[val]);
                        if (timeDistribution.series[val]) {
                          return timeDistribution.series[val].name;
                        } else {
                          return ""; // Return empty string if series[val] is undefined
                        }
                      },
                    },
                  },
                }}
                series={timeDistribution.series}
                type="area"
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
                Marks Analysis per Question
              </Typography>
              <Chart
                options={additionalChartData.options}
                series={additionalChartData.series}
                type="line"
                width="100%"
              />
            </Box>
          </Box>

          <Divider />
          <Footer />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
