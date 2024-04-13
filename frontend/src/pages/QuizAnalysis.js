import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, TextField, Typography } from "@mui/material";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import Container from "@mui/material/Container";

const QuizAnalysis = () => {
  const { uniqueCode } = useParams();
  const [mode, setMode] = useState("light");
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const LPtheme = createTheme(getLPTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });
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

  const [searchQuery, setSearchQuery] = useState("");
  const [quizTitle, setQuizTitle] = useState("");

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
        const uniqueQuestions = Array.from(
          new Set(marksData.map((mark) => mark.questionText))
        );
        const averageTimeSpent = uniqueQuestions.map((question) => {
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
              categories: uniqueQuestions,
            },
          },
          series: [{ data: averageTimeSpent }],
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uniqueCode]);

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

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
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

  return (
    <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
      <Box
        id="hero"
        sx={(theme) => ({
          width: "100%",
          backgroundImage:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #CEE5FD, #FFF)"
              : `linear-gradient(#02294F, ${theme.alpha("#090E10", 0.0)})`,
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
          <Typography variant="h4" sx={{ mb: 2 }}>
            ANALYSIS - {quizTitle}
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
              width: "100%",
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
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default QuizAnalysis;
