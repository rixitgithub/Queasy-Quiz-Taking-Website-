import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Container,
  Box,
  Button,
} from "@mui/material";
import { BASE_URL } from "./config";

const CalculateMarksPage = () => {
  const [totalMarks, setTotalMarks] = useState(null);
  const [fullMarks, setFullMarks] = useState(null);
  const [passingMarks, setPassingMarks] = useState(null);
  const { uniqueCode } = useParams();

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/quiz/${uniqueCode}/marks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setTotalMarks(data.totalMarks);
          setFullMarks(data.fullMarks);
          setPassingMarks(data.passingMarks);
        } else {
          console.error("Error fetching marks:", data.message);
        }
      } catch (error) {
        console.error("Error fetching marks:", error.message);
      }
    };

    fetchMarks();
  }, [uniqueCode]);

  return (
    <Container maxWidth="sm">
      <br />
      <br />
      <br />
      <Box
        mt={4}
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box
          mt={4}
          textAlign="center"
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <Box mr={24}>
            <Typography variant="h3" gutterBottom style={{ width: "400px" }}>
              Your Result
            </Typography>

            {totalMarks < passingMarks && (
              <Typography variant="body1" mt={6}>
                You didn't pass the test. Your marks are less than the passing
                marks.
              </Typography>
            )}
            <Button variant="contained" color="primary" href="/dash" mt={4}>
              Dashboard
            </Button>
          </Box>

          {totalMarks !== null &&
          fullMarks !== null &&
          passingMarks !== null ? (
            <CircularProgressSection
              totalMarks={totalMarks}
              fullMarks={fullMarks}
              passingMarks={passingMarks}
            />
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Box>
    </Container>
  );
};

const CircularProgressSection = ({ totalMarks, fullMarks, passingMarks }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      position="relative"
      display="inline-block"
    >
      <CircularProgress
        variant="determinate"
        value={(totalMarks / fullMarks) * 100}
        color={totalMarks >= passingMarks ? "primary" : "secondary"}
        size={200}
        thickness={2}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        textAlign="center"
      >
        <Typography variant="h4" gutterBottom>
          {isHovered
            ? `${((totalMarks / fullMarks) * 100).toFixed(2)}%`
            : `${totalMarks} / ${fullMarks}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CalculateMarksPage;
