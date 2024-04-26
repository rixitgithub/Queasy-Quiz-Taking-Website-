import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  CssBaseline,
  Divider,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import { useMediaQuery, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import Footer from "../components/Footer";
import Chart from "react-apexcharts";
import { useParams } from "react-router-dom";

export default function UserAnalysis() {
  const [mode, setMode] = useState("light");
  const { uniqueCode, userId } = useParams();
  const [showCustomTheme, setShowCustomTheme] = useState(true);

  const [quizTitle, setQuizTitle] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [marksDistribution, setMarksDistribution] = useState({
    options: {
      chart: {
        id: "marks-distribution-chart",
        type: "donut",
      },

      labels: isSmallScreen
        ? ["Correct", "Incorrect", "Unattempted"]
        : ["Correct Answers", "Incorrect Answers", "Unattempted Questions"],

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
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

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

  const [answerData, setAnswerData] = useState([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/answers`
        );
        const data = await response.json();
        console.log("this is fuck data", data);
        setAnswerData(data.answers);
        setAnswers(data.answers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers for the quiz:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const promises = answers.map(async (answer) => {
          const response = await fetch(
            `http://localhost:1234/questions/${answer.questionId}`
          );
          const data = await response.json();
          return {
            ...answer,
            questionText: data.question.text,
            totalmarks: data.question.marks,
          };
        });
        const answersWithQuestions = await Promise.all(promises);
        console.log("questioncheck", answersWithQuestions);
        setQuestions(answersWithQuestions);
      } catch (error) {
        console.error("Error fetching question details:", error);
      }
    };

    fetchQuestionDetails();
  }, [answers]);

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
        console.log("Marks Data:", marksData);
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

  const [marksData, setMarksData] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch marks for each question
        const marksResponse = await fetch(
          `http://localhost:1234/${uniqueCode}/user/marks`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!marksResponse.ok) {
          throw new Error("Failed to fetch marks data");
        }
        const marksData = await marksResponse.json();
        if (!marksData || marksData.length === 0) {
          throw new Error("No marks data found");
        }
        console.log("marrks", marksData);
        setMarksData(marksData);

        // Fetch user's rank
        const rankResponse = await fetch(
          `http://localhost:1234/${uniqueCode}/user/rank`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!rankResponse.ok) {
          throw new Error("Failed to fetch rank data");
        }
        const rankData = await rankResponse.json();
        if (!rankData.rank) {
          throw new Error("No rank data found");
        }
        setUserRank(rankData.rank);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uniqueCode]);

  const [commentsData, setCommentsData] = useState([]); // State to store comments for each question

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("boom boom");
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/comments`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch comments data");
        }
        const commentsData = await response.json();
        console.log("comments data", commentsData);
        setCommentsData(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [uniqueCode]);

  const currentUserAnswers = questions
    .filter((question) => question.userId === userId)
    .map((question) => {
      const commentObj =
        commentsData &&
        commentsData.find(
          (comment) => comment.questionId === question.questionId
        );
      return {
        ...question,
        comments: commentObj ? commentObj.comment : "-", // Default to "-" if comment not found
        marks:
          marksData.find((mark) => mark.questionId === question.questionId)
            ?.marks || 0,
      };
    });

  useEffect(() => {
    const fetchQuizTitle = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/title/${uniqueCode}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch quiz title");
        }
        const data = await response.json();
        setQuizTitle(data.title);
      } catch (error) {
        console.error("Error fetching quiz title:", error);
      }
    };

    fetchQuizTitle();
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
          style={{ width: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "95%",
              marginTop: { xs: 20, sm: 20 },
              marginBottom: { xs: 22, sm: 22 },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignSelf: "center",
                textAlign: "center",
                fontSize: "clamp(3.5rem, 10vw, 4rem)",
              }}
            >
              User Analysis - &nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={{
                  fontSize: "clamp(3rem, 10vw, 4rem)",
                  color: (theme) =>
                    theme.palette.mode === "light"
                      ? "primary.main"
                      : "primary.light",
                }}
              >
                {quizTitle}
              </Typography>
            </Typography>
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
                width: "80%",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
              }}
            >
              <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      {marksData.map((mark, index) => (
                        <TableCell key={index} align="right">{`Q${
                          index + 1
                        }`}</TableCell>
                      ))}
                      <TableCell align="right">Total Marks</TableCell>{" "}
                      {/* Add this line */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{userRank}</TableCell>
                      {marksData.map((mark, index) => (
                        <TableCell key={index} align="right">
                          {mark.marks}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        {marksData
                          .reduce((total, mark) => total + mark.marks, 0)
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "95%",
              marginTop: { xs: 5, sm: 5 },
            }}
          >
            <Box
              sx={{
                width: "80%",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
              }}
            >
              <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Question Number</TableCell>
                      <TableCell>Question Text</TableCell>
                      <TableCell>Answer</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell align="right">Marks Obtained</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentUserAnswers.map((answer, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ paddingRight: "16px" }}>
                          Q{index + 1}
                        </TableCell>
                        <TableCell style={{ paddingRight: "16px" }}>
                          {answer.questionText}
                        </TableCell>
                        <TableCell style={{ paddingRight: "16px" }}>
                          {answer.answer}
                        </TableCell>
                        <TableCell style={{ paddingRight: "16px" }}>
                          {answer.comments}
                        </TableCell>
                        <TableCell align="right">{answer.marks}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">
                        {marksData
                          .reduce((total, mark) => total + mark.marks, 0)
                          .toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "95%",
              marginTop: { xs: 20, sm: 20 },
              flexDirection: { xs: "column", sm: "row" }, // Stack cards vertically on small screens
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "50%" }, // Full width on small screens, half width on larger screens
                marginLeft: { xs: 0, sm: 10 }, // Add margin left only on larger screens to separate cards
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
                maxHeight: "450px",
                overflowY: "auto",
                flexDirection: { xs: "column", sm: "row" }, // Stack items vertically on small screens
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
              {/* Display labels and graph vertically on small screens */}
              <Box sx={{ width: "100%", marginBottom: { xs: "20px", sm: 0 } }}>
                <Chart
                  options={marksDistribution.options}
                  series={marksDistribution.series}
                  type="donut"
                  width="100%"
                  labels={
                    isSmallScreen ? null : marksDistribution.options.labels
                  } // Render labels only on larger screens
                />
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", sm: "50%" }, // Full width on small screens, half width on larger screens
                marginLeft: "10px",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
                maxHeight: "450px",
                overflowY: "auto",
                marginTop: isSmallScreen ? "3rem" : 0,
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
              marginTop: isSmallScreen ? 10 : { xs: 20, sm: 20 },
              flexDirection: { xs: "column", sm: "row" }, // Stack cards vertically on small screens
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "50%" }, // Full width on small screens, half width on larger screens
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
                width: { xs: "100%", sm: "50%" }, // Full width on small screens, half width on larger screens
                marginLeft: "10px",
                backgroundColor: showCustomTheme ? "#FFFFFF" : "#263238",
                borderRadius: "8px",
                boxShadow: showCustomTheme
                  ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                  : "0px 2px 4px rgba(255, 255, 255, 0.1)",
                padding: "20px",
                maxHeight: "450px",
                overflowY: "auto",
                marginTop: isSmallScreen ? "3rem" : 0,
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
        </Container>
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
