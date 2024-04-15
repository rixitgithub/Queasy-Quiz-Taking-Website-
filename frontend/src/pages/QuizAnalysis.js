import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

import { alpha } from "@mui/material";
import Footer from "../components/Footer";

const QuizAnalysis = () => {
  const { uniqueCode } = useParams();
  const [mode, setMode] = useState("light");
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
  const [marksData, setMarksData] = useState([]);
  const [filteredMarksData, setFilteredMarksData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "total-marks-chart",
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val.toString();
          },
        },
      },
      yaxis: {
        title: {
          text: "Total Marks",
        },
      },
    },
    series: [
      {
        name: "Total Marks",
        data: [],
      },
    ],
  });
  const [averageScoreChartData, setAverageScoreChartData] = useState({
    options: {
      chart: {
        id: "average-score-chart",
        type: "bar",
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      xaxis: {
        title: {
          text: "Average Score",
        },
      },
      yaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val.toString();
          },
        },
      },
    },
    series: [
      {
        data: [],
      },
    ],
  });
  const [timeSpentChartData, setTimeSpentChartData] = useState({
    options: {
      chart: {
        id: "time-spent-chart",
        type: "area",
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val.toString();
          },
        },
      },
      yaxis: {
        title: {
          text: "Time Spent",
        },
      },
    },
    series: [
      {
        name: "Average Time Spent",
        data: [],
      },
    ],
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
    },
    series: [
      {
        name: "Highest Marks",
        type: "line",
        data: [],
      },
      {
        name: "Lowest Marks",
        type: "line",
        data: [],
      },
      {
        name: "Median Marks",
        type: "line",
        data: [],
      },
      {
        name: "Average Marks",
        type: "line",
        data: [],
      },
    ],
  });
  const [marksDistribution, setMarksDistribution] = useState({
    options: {
      chart: {
        id: "marks-distribution-chart",
        type: "donut",
      },
      labels: [
        "100%",
        "90-100%",
        "80-90%",
        "70-80%",
        "60-70%",
        "50-60%",
        "40-50%",
        "33-40%",
        "<33%",
      ],
      colors: [
        "#7cb5ec",
        "#90ed7d",
        "#f7a35c",
        "#8085e9",
        "#f15c80",
        "#e4d354",
        "#2b908f",
        "#f45b5b",
        "#91e8e1",
      ], // Soft and harmonious colors // Add your desired colors here
    },
    series: [],
  });

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/total-marks/${uniqueCode}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        console.log("this is the total marks", data);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uniqueCode]);

  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/feedback/${uniqueCode}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }
        const data = await response.json();
        console.log(data);
        setFeedbacks(data.feedback);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchMarksAnalysisData = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/quiz/${uniqueCode}/marks-analysis`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch marks analysis data");
        }
        const data = await response.json();
        console.log("marks analysis", data);

        // Map marks analysis data to marksDistribution state
        const seriesData = Object.values(data.marksAnalysis);
        setMarksDistribution((prev) => ({
          ...prev,
          series: seriesData,
        }));
      } catch (error) {
        console.error("Error fetching marks analysis data:", error);
      }
    };

    fetchMarksAnalysisData();
  }, [uniqueCode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marksResponse = await fetch(
          `http://localhost:1234/marks/${uniqueCode}`
        );
        const marksData = await marksResponse.json();
        if (!marksResponse.ok || marksData.length === 0) {
          throw new Error("Failed to fetch marks data");
        }

        setMarksData(marksData);
        setFilteredMarksData(marksData);
        // Filter marks data based on search query
        const filteredData = marksData.filter((mark) =>
          mark.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Total Marks Chart Data
        const totalMarksMap = new Map();
        marksData.forEach((mark) => {
          const userId = mark.username;
          if (!totalMarksMap.has(userId)) {
            totalMarksMap.set(userId, 0);
          }
          totalMarksMap.set(userId, totalMarksMap.get(userId) + mark.marks);
        });
        const usernames = Array.from(totalMarksMap.keys());
        const totalMarks = Array.from(totalMarksMap.values());
        setChartData((prevChartData) => ({
          ...prevChartData,
          options: {
            ...prevChartData.options,
            xaxis: {
              ...prevChartData.options.xaxis,
              categories: usernames,
            },
          },
          series: [{ data: totalMarks }],
        }));

        // Average Score Chart Data
        const questionIds = Array.from(
          new Set(marksData.map((mark) => mark.questionId))
        );
        const averageScores = [];
        questionIds.forEach((questionId) => {
          const marksForQuestion = marksData.filter(
            (mark) => mark.questionId === questionId
          );
          const totalMarksForQuestion = marksForQuestion.reduce(
            (acc, curr) => acc + curr.marks,
            0
          );
          const averageScore = totalMarksForQuestion / marksForQuestion.length;
          averageScores.push(averageScore);
        });
        setAverageScoreChartData((prevChartData) => ({
          ...prevChartData,
          options: {
            ...prevChartData.options,
            xaxis: {
              categories: questionIds.map((questionId) => {
                const correspondingMark = marksData.find(
                  (mark) => mark.questionId === questionId
                );
                return correspondingMark ? correspondingMark.questionText : "";
              }),
            },
          },
          series: [{ data: averageScores }],
        }));

        // Time Spent Chart Data
        const uniqueQuestionsTime = Array.from(
          new Set(marksData.map((mark) => mark.questionText))
        );
        const averageTimeSpent = uniqueQuestionsTime.map((question) => {
          const timeSpentForQuestion = marksData
            .filter((mark) => mark.questionText === question)
            .map((mark) => mark.timespent);
          const totalSpent = timeSpentForQuestion.reduce(
            (acc, curr) => acc + curr,
            0
          );
          return totalSpent / timeSpentForQuestion.length;
        });
        setTimeSpentChartData((prevChartData) => ({
          ...prevChartData,
          options: {
            ...prevChartData.options,
            xaxis: {
              categories: uniqueQuestionsTime,
            },
          },
          series: [{ data: averageTimeSpent }],
        }));

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
              name: "Lowest Marks",
              type: "line",
              data: uniqueQuestions.map((question) => {
                const lowestMark = Math.min(
                  ...marksData
                    .filter((mark) => mark.questionText === question)
                    .map((mark) => mark.lowestMarks)
                );
                return lowestMark;
              }),
            },
            {
              name: "Median Marks",
              type: "line",
              data: uniqueQuestions.map((question) => {
                const medianMark = marksData
                  .filter((mark) => mark.questionText === question)
                  .map((mark) => mark.medianMarks);
                return medianMark;
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
          ],
        };

        setAdditionalChartData(additionalChartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uniqueCode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
    setShowCustomTheme((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsernames = chartData.options.xaxis.categories.filter(
    (username) => username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let filteredSeriesData = [];
  if (filteredUsernames.length > 0) {
    filteredSeriesData = filteredUsernames.map((username) => {
      const index = chartData.options.xaxis.categories.indexOf(username);
      return chartData.series[0].data[index];
    });
  }

  const filteredChartData = {
    ...chartData,
    options: {
      ...chartData.options,
      xaxis: {
        ...chartData.options.xaxis,
        categories: filteredUsernames,
      },
    },
    series: [{ data: filteredSeriesData }],
  };

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
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
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
        <AppAppBar toggleColorMode={toggleColorMode} />
        <Box sx={{ flexGrow: 1 }}>
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
            <Typography variant="h4" sx={{ mb: 2 }}>
              MARKS ANALYSIS - {quizTitle}
            </Typography>
            <TextField
              label="Enter Username"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: 0, width: "50%" }}
            />
            {filteredUsernames.length === 0 && (
              <Typography variant="subtitle1">No user found</Typography>
            )}
            <Box
              id="image"
              sx={{
                mt: { xs: 4, sm: 1 },
                alignSelf: "center",
                width: "80%",
                margin: "auto",
              }}
            >
              {/* Total Marks Chart */}
              <Chart
                options={filteredChartData.options}
                series={filteredChartData.series}
                type="bar"
                width="100%"
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "95%",
                marginTop: { xs: 20, sm: 20 },
              }}
            >
              {/* Average Score Chart */}
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
                  Average Score Obtained / Question
                </Typography>
                <Chart
                  options={averageScoreChartData.options}
                  series={averageScoreChartData.series}
                  type="bar"
                  width="100%"
                />
              </Box>

              {/* Time Spent Chart */}
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
                  Average Time Spent / Question
                </Typography>
                <Chart
                  options={timeSpentChartData.options}
                  series={timeSpentChartData.series}
                  type="area"
                  width="100%"
                />
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
              {/* Additional Chart - Highest, Lowest, Average, Median Marks per Question */}

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
                {/* Additional Chart */}
                <Chart
                  options={additionalChartData.options}
                  series={additionalChartData.series}
                  type="line"
                  width="100%"
                />
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
              {/* Average Score Chart */}
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
                  Marks Distribution
                </Typography>
                <Chart
                  options={marksDistribution.options}
                  series={marksDistribution.series}
                  type="donut"
                  width="100%"
                />
              </Box>

              {/* Time Spent Chart */}
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
                  maxHeight: "450px", // Set a maximum height for the container
                  overflowY: "auto", // Enable vertical scrolling when content exceeds the container height
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
                {feedbacks.map((feedback, index) => (
                  <Paper key={index} elevation={3} sx={{ p: 2, mt: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: mode === "light" ? "#000000" : "#FFFFFF" }}
                    >
                      {feedback}
                    </Typography>
                  </Paper>
                ))}
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
              {/* Additional Chart - Highest, Lowest, Average, Median Marks per Question */}

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
                <Typography variant="h5" sx={{ mt: 3, mb: 3 }}>
                  User Scores
                </Typography>
                <Paper elevation={3} sx={{ p: 2, borderRadius: "8px" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sno.</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        {/* Display "Q1", "Q2", "Q3", and so on as column headers */}
                        {Array.from(
                          new Set(marksData.map((mark) => mark.questionId))
                        ).map((questionId, index) => (
                          <TableCell key={questionId}>{`Q${
                            index + 1
                          }`}</TableCell>
                        ))}
                        <TableCell>Total Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Map over userData to display each user */}
                      {userData.map((user, index) => (
                        <TableRow key={user.email}>
                          <TableCell>{index + 1}</TableCell> {/* Add sno */}
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          {/* Loop over unique question IDs to display marks for each question */}
                          {Array.from(
                            new Set(marksData.map((mark) => mark.questionId))
                          ).map((questionId) => {
                            const userMark = marksData.find(
                              (mark) =>
                                mark.questionId === questionId &&
                                mark.username === user.username
                            );
                            return (
                              <TableCell key={questionId}>
                                {userMark ? userMark.marks : "-"}
                              </TableCell>
                            );
                          })}
                          <TableCell>{user.totalMarks}</TableCell>{" "}
                          {/* Display total score */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Box>
          </Container>
        </Box>
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default QuizAnalysis;
