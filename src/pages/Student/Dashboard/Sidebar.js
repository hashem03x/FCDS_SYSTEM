import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import {
  faAnglesRight,
  faCalendarDays,
  faChartSimple,
  faClipboardUser,
  faComment,
  faFileLines,
  faGear,
  faGraduationCap,
  faHouse,
  faAnglesLeft,
  faRightFromBracket,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItemIcon, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    {
      path: "/student",
      name: "Home",
      icon: faHouse,
    },
    {
      path: "/student/performance",
      name: "Performance",
      icon: faChartSimple,
    },
    {
      path: "/student/registration",
      name: "Registration",
      icon: faFileLines,
    },
    {
      path: "/student/lectures-table",
      name: "Lectures Table",
      icon: faCalendarDays,
    },
    {
      path: "/student/exams-table",
      name: "Exam's Table",
      icon: faGraduationCap,
    },
    {
      path: "/student/attendance",
      name: "Attendance",
      icon: faClipboardUser,
    },
    {
      path: "/student/complaints",
      name: "Complaints",
      icon: faExclamation,
    },
    {
      path: "/student/profile",
      name: "Profile",
      icon: faGear,
    },
  ];

  return (
    <Box sx={{ display: "flex", backgroundColor: "white" }}>
      <CssBaseline />

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton>
            {open ? (
              <FontAwesomeIcon onClick={handleDrawerClose} icon={faAnglesLeft} />
            ) : (
              <FontAwesomeIcon onClick={handleDrawerOpen} icon={faAnglesRight} />
            )}
            {theme.direction === "rtl" ? "" : ""}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.name} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={[
                    {
                      minHeight: 48,
                      px: 2.5,
                      backgroundColor: isActive ? "rgba(0, 0, 0, 0.08)" : "transparent",
                      "&:hover": {
                        backgroundColor: isActive ? "rgba(0, 0, 0, 0.12)" : "rgba(0, 0, 0, 0.04)",
                      },
                    },
                    open
                      ? {
                          justifyContent: "initial",
                        }
                      : {
                          justifyContent: "center",
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                        color: isActive ? "primary.main" : "inherit",
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={[
                      {
                        color: isActive ? "primary.main" : "inherit",
                      },
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        {open ? (
          <Typography sx={{ color: "grey", fontSize: "12px", marginLeft: "8px" }}>
            Communication
          </Typography>
        ) : (
          <Divider sx={{ border: "1px solid" }} />
        )}
        <List>
          {["Messages"].map((text) => {
            const isActive = location.pathname === "/student/messages";
            return (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => navigate("/student/messages")}
                  sx={[
                    {
                      minHeight: 48,
                      px: 2.5,
                      backgroundColor: isActive ? "rgba(0, 0, 0, 0.08)" : "transparent",
                      "&:hover": {
                        backgroundColor: isActive ? "rgba(0, 0, 0, 0.12)" : "rgba(0, 0, 0, 0.04)",
                      },
                    },
                    open
                      ? {
                          justifyContent: "initial",
                        }
                      : {
                          justifyContent: "center",
                        },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      {
                        minWidth: 0,
                        justifyContent: "center",
                        color: isActive ? "primary.main" : "inherit",
                      },
                      open
                        ? {
                            mr: 3,
                          }
                        : {
                            mr: "auto",
                          },
                    ]}
                  >
                    <FontAwesomeIcon icon={faComment} />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={[
                      {
                        color: isActive ? "primary.main" : "inherit",
                      },
                      open
                        ? {
                            opacity: 1,
                          }
                        : {
                            opacity: 0,
                          },
                    ]}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <List>
          {["Logout"].map((text) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => logout()}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                      color: "red",
                    },
                    open
                      ? {
                          mr: 3,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={[
                    open
                      ? {
                          color: "red",
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
