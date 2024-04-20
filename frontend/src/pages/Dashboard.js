import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Grid,
  CardHeader,
  Tooltip,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BarChartIcon from "@mui/icons-material/BarChart";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // Import the InfoOutlined icon
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import arrowImage from "../assets/arrow.png";
import getLPTheme from "../getLPTheme";
import AppAppBar from "../components/AppAppBar";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

export default function SignIn() {
  const [mode, setMode] = useState("light");
  const [scrollBackground, setScrollBackground] = useState(
    "rgba(255, 255, 255, 0.9)"
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dropdownIndex, setDropdownIndex] = useState(null);

  const [headerLoaded, setHeaderLoaded] = useState(false); // State to track if header animation is completed
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const workspaceId = searchParams.get("workspace");
  const [workspaces, setWorkspaces] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [expandedBannerIndex, setExpandedBannerIndex] = useState(null);
  const [hideDetails, setHideDetails] = useState(true);

  const handleCopyUniqueCode = (uniqueCode, title) => {
    navigator.clipboard.writeText(uniqueCode);
    setSnackbarMessage(`Unique code for ${title} copied!!!`);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    // Set a timeout to mark the header animation as completed after a certain delay
    const timeout = setTimeout(() => {
      setHeaderLoaded(true);
    }, 1000); // Adjust the delay as needed
    return () => clearTimeout(timeout);
  }, []);

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setScrollBackground("#CEE5FD");
    } else {
      setScrollBackground("rgba(255, 255, 255, 0.9)");
    }
  };

  const toggleColorMode = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("http://localhost:1234/workspaces", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setWorkspaces(data.workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error.message);
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch("http://localhost:1234/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: workspaceName }),
      });
      if (response.ok) {
        setOpenDialog(false);
        fetchWorkspaces();
      } else {
        console.error("Failed to create workspace:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating workspace:", error.message);
    }
  };

  const fetchQuizzes = async (workspaceId) => {
    try {
      const response = await fetch(
        `http://localhost:1234/workspaces/${workspaceId}/quizzes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      console.log("name", data);
      setQuizzes(
        data.quizzes.map((quiz, index) => ({
          ...quiz,
          color: getRandomColor(index),
        }))
      );
    } catch (error) {
      console.error("Error fetching quizzes:", error.message);
    }
  };

  const handleAddIconClick = () => {
    navigate(`/${workspaceId}/create`);
  };

  const getRandomColor = (index) => {
    // Define an array of 25 harmonious colors
    const colors = [
      "#6E7B8B",
      "#8F9AA2",
      "#A5B8C2",
      "#CBD2DB",
      "#D9E2E7",
      "#E5E9EF",
      "#F1F3F6",
      "#ECE8E3",
      "#E3DED8",
      "#DAD5CC",
      "#D0CABF",
      "#C5BEB1",
      "#BAB4A2",
      "#AFA591",
      "#A39E80",
      "#989670",
    ];

    // Return color based on index
    return colors[index % colors.length];
  };
  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffMs = now - createdDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }
  };

  const handleDetailsClick = (quiz) => {
    console.log("Details clicked for quiz:", quiz);
  };

  const toggleDropdown = (index) => {
    setExpandedBannerIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleCardFlip = (index) => {
    setFlippedCards((prevFlippedCards) => ({
      ...prevFlippedCards,
      [index]: !prevFlippedCards[index],
    }));
  };

  const handlePublishQuiz = async (quiz) => {
    try {
      console.log("first quiz", quiz);
      const response = await fetch(
        `http://localhost:1234/quizzes/${quiz._id}/publish`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        // Toggle the isLive property of the quiz
        quiz.isLive = !quiz.isLive;

        // Display appropriate alert message based on the isLive property
        if (quiz.isLive) {
          // Quiz is now published
          setSnackbarMessage(
            `${quiz.title} is now published. Users can attempt this quiz.`
          );
        } else {
          // Quiz is paused
          setSnackbarMessage(
            `${quiz.title} is paused. Users cannot attempt this quiz anymore.`
          );
        }

        // Show the snackbar alert
        setSnackbarOpen(true);
      } else {
        console.error("Failed to publish quiz:", response.statusText);
      }
    } catch (error) {
      console.error("Error publishing quiz:", error.message);
    }
  };

  //share

  const handleShareButtonClick = (quiz) => {
    // Copy link to clipboard
    const quizLink = `${window.location.origin}/quiz/${quiz.uniqueCode}/start`;
    navigator.clipboard.writeText(quizLink);

    // Show snackbar message
    setSnackbarMessage("Link copied to clipboard: " + quizLink);
    setSnackbarOpen(true);
  };

  const handleSnackbarShareClose = () => {
    setSnackbarOpen(false);
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
            pt: { xs: 5, sm: 12 },
            pb: { xs: 8, sm: 12 },
            transition: "opacity 1s", // Add transition for opacity
            opacity: headerLoaded ? 1 : 0, // Set opacity based on headerLoaded state
          }}
          style={{ width: "110%" }}
        >
          {workspaces.length === 0 && (
            <Box>
              <img
                src={arrowImage}
                alt="Arrow"
                style={{
                  width: "50px",
                  height: "50px",
                  position: "absolute",
                  top: "50%",
                  left: "25%",
                  transform: "translate(-50%, -50%) rotate(180deg)",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  position: "absolute",
                  top: "52%",
                  left: "calc(25% + 30px)",
                  transform: "translateY(-50%)",
                  color: "black",
                }}
              >
                You don't have any workspace.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  position: "absolute",
                  top: "55%",
                  left: "calc(25% + 30px)",
                  transform: "translateY(-50%)",
                  color: "black",
                }}
              >
                Create one here
              </Typography>
            </Box>
          )}

          {/* Sidebar with workspaces */}
          <Box
            sx={{
              position: "fixed",
              top: 110, // Fixed from the top
              bottom: 40, // Extend to the bottom of the viewport
              left: "1%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              zIndex: "1000",
              color: "black",
              width: "20%",
              padding: "20px",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              transition: "background-color 0.3s ease-in-out",
              border: "1px solid black",
              overflowY: "auto", // Add scrollbar when content exceeds viewport height
              scrollbarWidth: "thin", // Customize scrollbar width
              scrollbarColor: "rgba(255, 255,255, 0.2) transparent", // Customize scrollbar color
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "black",
                width: "100%",
                fontSize: "24px",
                textAlign: "left",
                mb: 2,
                position: "relative",
              }}
            >
              Your Workspaces
              <IconButton
                onClick={() => setOpenDialog(true)}
                sx={{
                  color: "black",
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <AddIcon />
              </IconButton>
            </Typography>

            <Divider />
            <List sx={{ width: "100%" }}>
              {workspaces.map((workspace, index) => (
                <ListItem
                  key={index}
                  component={Link}
                  to={{
                    pathname: "/dash",
                    search: `?workspace=${workspace.id}`,
                  }}
                  button
                  onClick={() => fetchQuizzes(workspace.id)}
                  sx={{
                    borderRadius: "5px",
                    transition: "color 0.3s ease", // Adjust transition for color only
                    "&:hover": {
                      color: "inherit", // Keep the hover color same as the default
                      backgroundColor:
                        workspaceId === workspace.id ? "#333" : "#F5F5F5", // Keep the background color if already selected
                    },
                    color: workspaceId === workspace.id ? "#white" : "inherit", // Add text color when workspace ID matches the query
                    backgroundColor:
                      workspaceId === workspace.id ? "#333" : "inherit", // Add background color when workspace ID matches the query
                  }}
                >
                  <ListItemText
                    primary={workspace.name}
                    sx={{
                      textAlign: "left",
                      width: "70%",
                      color: workspaceId === workspace.id ? "#fff" : "inherit",
                    }}
                  />
                  <ListItemText
                    primary={workspace.quizCount}
                    sx={{
                      textAlign: "right",
                      width: "30%",
                      color: workspaceId === workspace.id ? "#fff" : "inherit",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Quizzes */}
          <Box mt={10} ml={20}>
            {workspaceId && (
              <Typography variant="h4" sx={{ marginBottom: 2 }}>
                {
                  workspaces.find((workspace) => workspace.id === workspaceId)
                    ?.name
                }
              </Typography>
            )}
            <Grid container spacing={2} sx={{ justifyContent: "left" }}>
              {/* Placeholder card */}
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <Link
                  to={`/${workspaceId}/create`}
                  style={{ textDecoration: "none" }}
                  sx={{
                    "&:hover": {
                      transform: "scale(1.05)", // Scale up on hover
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow on hover
                    },
                    cursor: "pointer", // Change cursor to pointer on hover
                    textDecoration: "none", // Remove underline from link
                    color: "inherit", // Inherit color from parent
                  }}
                >
                  <Card
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: 275,
                      height: "150px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      position: "relative",
                      transition:
                        "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Add transition for smooth hover effect
                    }}
                  >
                    {/* Card content */}
                    <Box sx={{ color: "#999" }}>
                      <AddIcon sx={{ fontSize: "5rem" }} />
                    </Box>
                  </Card>
                </Link>
              </Grid>
              {/* Actual quizzes cards */}
              {quizzes.map((quiz, index) => (
                <Grid
                  item
                  key={index}
                  xs={12}
                  sm={4}
                  md={4}
                  lg={4}
                  sx={{
                    ...(index === 0 &&
                      quizzes.length === 1 && { marginLeft: "150px" }),
                  }}
                >
                  {/* Rest of the card content */}
                  <Card
                    sx={{
                      minWidth: 275,
                      height: "150px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      position: "relative",
                      transition: "transform 0.3s ease-in-out", // Add transition for smooth hover effect

                      transform: flippedCards[index]
                        ? "rotateY(180deg)"
                        : "none",
                    }}
                  >
                    <CardHeader
                      sx={{
                        backgroundColor: quiz.color,
                        color: "#fff",
                        textAlign: "left",
                        padding: "20px",
                        borderRadius: "5px 5px 0 0",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        height: "40px",
                        position: "relative",
                      }}
                    >
                      {expandedBannerIndex === index && (
                        <Box>
                          <Typography variant="body1">
                            Unique Code: {quiz.uniqueCode}
                          </Typography>
                        </Box>
                      )}
                      {expandedBannerIndex === index && (
                        <Box>
                          <Typography variant="body1">
                            Submissions: {quiz.attempted.length}
                          </Typography>
                        </Box>
                      )}
                      {expandedBannerIndex === index && (
                        <Box>
                          <Typography variant="body1">
                            Created: {getTimeElapsed(quiz.createdAt)}
                          </Typography>
                        </Box>
                      )}
                    </CardHeader>

                    <CardContent
                      sx={{
                        padding: "20px",
                        textAlign: "left",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        transform: flippedCards[index]
                          ? "rotateY(180deg)"
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "0%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "40px", // Diameter of the circle
                          height: "40px", // Diameter of the circle
                          backgroundColor: quiz.color, // Use the quiz color for the circle
                          borderRadius: "50%", // Make it circular
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Optional: Add shadow
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          top: "0%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "35px", // Adjust diameter as needed
                          height: "35px", // Adjust diameter as needed
                          backgroundColor: "#fff", // White color
                          borderRadius: "50%", // Circular shape
                        }}
                      >
                        <IconButton
                          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          onClick={() => toggleCardFlip(index)}
                        >
                          <AutorenewIcon style={{ color: quiz.color }} />
                        </IconButton>
                      </div>
                      {flippedCards[index] ? (
                        <>
                          {/* Quiz title displayed at the top */}

                          <Typography
                            variant="h6"
                            sx={{
                              marginTop: 1,
                              marginBottom: 0.5,
                              fontWeight: "800", // Bold font weight
                              textAlign: "center", // Center align text
                            }}
                          >
                            {quiz.title}
                          </Typography>
                          {/* Bottom row of icons */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-evenly",
                              marginTop: 0.5,
                              marginBottom: 0,
                            }}
                          >
                            <Tooltip
                              title={quiz.isLive ? "Pause" : "Publish"}
                              placement="top"
                            >
                              <IconButton
                                onClick={() => handlePublishQuiz(quiz)}
                              >
                                {quiz.isLive ? (
                                  <StopIcon
                                    sx={{
                                      fontSize: 15,
                                      color: "black", // Set icon color to black
                                      "&:hover": {
                                        color: "#F44336", // Change icon color to red on hover
                                      },
                                    }}
                                  />
                                ) : (
                                  <PlayCircleFilledIcon
                                    sx={{
                                      fontSize: 15,
                                      color: "black", // Set icon color to black
                                      "&:hover": {
                                        color: "#4CAF50", // Change icon color to green on hover
                                      },
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Share" placement="top">
                              <IconButton
                                onClick={() => handleShareButtonClick(quiz)}
                              >
                                <ShareIcon
                                  sx={{
                                    fontSize: 15,
                                    color: "black", // Set icon color to black
                                    "&:hover": {
                                      color: "#2196F3", // Change icon color to blue on hover
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" placement="top">
                              <IconButton>
                                <EditIcon
                                  sx={{
                                    fontSize: 15,
                                    color: "black", // Set icon color to black
                                    "&:hover": {
                                      color: "#FFEB3B", // Change icon color to yellow on hover
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Check Responses" placement="top">
                              <IconButton>
                                <CheckIcon
                                  sx={{
                                    fontSize: 15,
                                    color: "black", // Set icon color to black
                                    "&:hover": {
                                      color: "#FF9800", // Change icon color to orange on hover (you can adjust the color as needed)
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Analytics" placement="top">
                              <IconButton>
                                <BarChartIcon
                                  sx={{
                                    fontSize: 15,
                                    color: "black", // Set icon color to black
                                    "&:hover": {
                                      color: "#9C27B0", // Change icon color to purple on hover (you can adjust the color as needed)
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top">
                              <IconButton>
                                <DeleteIcon
                                  sx={{
                                    fontSize: 15,
                                    color: "black", // Set icon color to black
                                    "&:hover": {
                                      color: "#F44336", // Change icon color to red on hover
                                    },
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      ) : (
                        // Render default content when the card is not flipped
                        <>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "black",
                              width: "100%",
                              fontSize: "24px",
                              fontWeight: "800",
                              textAlign: "left",
                              position: "relative",
                            }}
                          >
                            {quiz.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "400",
                              fontSize: "20",
                              color: "grey",
                              cursor: "pointer",
                              position: "absolute",
                              top: "30px", // Adjust vertical positioning as needed
                              right: "20px", // Position to the right of the card
                            }}
                            onClick={() =>
                              handleCopyUniqueCode(quiz.uniqueCode, quiz.title)
                            }
                          >
                            {quiz.uniqueCode}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ position: "relative", bottom: 0, left: 0 }}
                          >
                            SUBMISSIONS
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontStyle="italic"
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: "80px",
                            }}
                          >
                            {quiz.attempted.length} {/* Count of submissions */}
                          </Typography>
                          {/* Time elapsed at the bottom right */}
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ position: "absolute", bottom: 0, right: 5 }}
                          >
                            {getTimeElapsed(quiz.createdAt)}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Dialog for creating new workspace */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Slide}
            sx={{
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          >
            <DialogTitle>Create your new workspace</DialogTitle>
            <DialogContent>
              <TextField
                label="Name of your Workspace"
                variant="outlined"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                fullWidth
                autoFocus
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                onClick={handleCreateWorkspace}
                variant="contained"
                color="primary"
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000} // Adjust duration as needed
            onClose={handleSnackbarShareClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarShareClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
