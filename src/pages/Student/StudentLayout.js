import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Sidebar from "./Dashboard/Sidebar"; // Import the Sidebar
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "./StudentLayout.css";

// API base URL
const API_BASE_URL = "https://profound-balance-production.up.railway.app";
const isArabicText = (text) => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
};
// Memoized API request function
const makeApiRequest = async (endpoint, method = "POST", body = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

const ChatbotWindow = React.memo(({ isOpen, onClose, studentId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const initializeChatbot = async () => {
      if (isOpen && !isInitialized) {
        try {
          const data = await makeApiRequest("initialize", "POST", {
            student_id: studentId,
          });
          if (data.success) {
            setIsInitialized(true);
            setMessages([
              {
                type: "bot",
                response: { type: "text", content: data.message },
              },
            ]);
          }
        } catch (error) {
          console.error("Error initializing chatbot:", error);
        }
      }
    };

    initializeChatbot();
  }, [isOpen, isInitialized, studentId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const data = await makeApiRequest("chat", "POST", {
        message: inputMessage,
      });
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", response: data.response },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          response: {
            type: "text",
            content: "Sorry, I encountered an error. Please try again.",
          },
        },
      ]);
    }
  }, [inputMessage]);

  const formatTableData = useCallback((data, headers) => {
    return data.map((row) => {
      const rowData = {};
      headers.forEach((header) => {
        rowData[header.toLowerCase()] = row[header.toLowerCase()];
      });
      return rowData;
    });
  }, []);

  const renderResponse = useCallback(
    (response) => {
      if (!response || !response.type) {
        return (
          <div
            style={{
              direction: isArabicText(response?.content || response)
                ? "rtl"
                : "ltr",
              textAlign: isArabicText(response?.content || response)
                ? "right"
                : "left",
            }}
            className="message-content error-message"
          >
            {response?.content || response}
          </div>
        );
      }

      switch (response.type) {
        case "text":
          return (
            <div
              className="message-content"
              style={{
                direction: isArabicText(response.content) ? "rtl" : "ltr",
                textAlign: isArabicText(response.content) ? "right" : "left",
              }}
            >
              {response.content}
            </div>
          );

        case "links":
          return (
            <div className="message-content">
              <h4 className="response-title">{response.content.title}</h4>
              <div className="youtube-links">
                {response.content.videos.map((video, index) => (
                  <div key={index} className="youtube-link-card">
                    <div className="youtube-link-header">
                      <span className="youtube-link-title">{video.title}</span>
                      <span className="youtube-link-author">👤 {video.author}</span>
                    </div>
                    <div className="youtube-link-details">
                      {video.duration && <span className="youtube-link-duration">⏱️ {video.duration}</span>}
                      {video.views > 0 && <span className="youtube-link-views">👁️ {video.views.toLocaleString()} views</span>}
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube-link-button"
                    >
                      Watch Video
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );

        case "table":
          const formattedTableData = formatTableData(
            response.data,
            response.headers
          );
          return (
            <div className="message-content">
              <h4 className="response-title">{response.title}</h4>
              <div className="table-container">
                <table className="response-table">
                  <thead>
                    <tr>
                      {response.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formattedTableData.map((data, rowIndex) => (
                      <tr key={rowIndex}>
                        {response.headers.map((header, index) => (
                          <td className="w-100" key={index}>
                            {data[header.toLowerCase()]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

        case "announcement":
          return (
            <div className="message-content">
              <h4 className="response-title">{response.title}</h4>
              {response.data.map((announcement, index) => (
                <div className="announcement-card" key={index}>
                  <div className="announcement-header">
                    <span className="announcement-sender">
                      {announcement.from}
                    </span>
                    <span className="announcement-date">
                      {announcement.date}
                    </span>
                  </div>
                  <div className="announcement-body">
                    {announcement.content}
                  </div>
                </div>
              ))}
            </div>
          );

        case "doctor_info":
          return (
            <div className="message-content">
              <h4 className="response-title">{response.title}</h4>
              <div className="doctor-info-card">
                <div className="info-section">
                  <p>
                    <strong>Name:</strong> {response.data.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {response.data.email}
                  </p>
                </div>
                {response.data.courses.length > 0 && (
                  <div className="courses-section">
                    <h5>Courses Teaching:</h5>
                    <ul className="courses-list">
                      {response.data.courses.map((course, index) => (
                        <li key={index}>
                          <span className="course-code">{course.code}</span>
                          <span className="course-name">{course.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );

        case "course_detail":
          return (
            <div className="message-content">
              <h4 className="response-title">
                {response.data.code}: {response.data.name}
              </h4>
              <div className="course-details-card">
                <div className="info-section">
                  <p>
                    <strong>Instructor:</strong> {response.data.instructor}
                  </p>
                  <p>
                    <strong>Department:</strong> {response.data.department}
                  </p>
                  <p>
                    <strong>Credit Hours:</strong> {response.data.creditHours}
                  </p>
                  <p>
                    <strong>Semester:</strong> {response.data.semester}
                  </p>
                </div>
                {response.data.lectureSessions.length > 0 && (
                  <div className="sessions-section">
                    <h5>Lecture Sessions:</h5>
                    <ul className="sessions-list">
                      {response.data.lectureSessions.map((session, index) => (
                        <li key={index} className="session-item">
                          <span className="session-day">{session.day}</span>
                          <span className="session-time">{session.time}</span>
                          <span className="session-room">
                            Room: {session.room}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {response.data.sections.length > 0 && (
                  <div className="sections-section">
                    <h5>Sections:</h5>
                    {response.data.sections.map((section, index) => (
                      <div key={index} className="section-card">
                        <h6 className="section-header">
                          {section.sectionId} (TA: {section.ta})
                        </h6>
                        <ul className="section-sessions">
                          {section.sessions.map((session, sessionIndex) => (
                            <li key={sessionIndex} className="session-item">
                              <span className="session-day">{session.day}</span>
                              <span className="session-time">
                                {session.time}
                              </span>
                              <span className="session-room">
                                Room: {session.room}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );

        default:
          return (
            <div className="message-content error-message">
              Unknown response type
            </div>
          );
      }
    },
    [formatTableData]
  );

  const messageList = useMemo(() => {
    return messages.map((message, index) => (
      <div key={index} className={`message ${message.type}`}>
        {message.type === "user" ? (
          <div
            className="message-content"
            style={{
              direction: isArabicText(message.content) ? "rtl" : "ltr",
              textAlign: isArabicText(message.content) ? "right" : "left",
            }}
          >
            {message.content}
          </div>
        ) : (
          renderResponse(message?.response)
        )}
      </div>
    ));
  }, [messages, renderResponse]);

  return (
    <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
      <div className="chatbot-header">
        <h3>College Assistant</h3>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>
      <div className="chatbot-messages">
        <div className="message text">
          <div className="message-content">
            <strong>Welcome to the College Assistant Chatbot!</strong>
            <p>You can ask about:</p>
            <ul>
              <li>📢 Announcements</li>
              <li>📝 Complaints</li>
              <li>📚 Courses (search by name/code)</li>
              <li>📝 Exams</li>
              <li>📊 Grades</li>
              <li>👨‍🏫 Who teaches a course</li>
              <li>🗓️ My class schedule</li>
              <li>📅 When are my classes</li>
              <li>📖 What courses am I taking</li>
            </ul>
          </div>
        </div>
        {messageList}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
});

// Memoized StudentLayout component
const StudentLayout = React.memo(() => {
  const [open, setOpen] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { user } = useAuth();

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleChatbot = useCallback(() => {
    setIsChatbotOpen((prev) => !prev);
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar Drawer */}
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, mt: 4 }}>
          <Outlet />
        </Box>

        {/* Chatbot Button */}
        <button className="chatbot-button" onClick={toggleChatbot}>
          <FontAwesomeIcon icon={faRobot} />
        </button>

        {/* Chatbot Window */}
        <ChatbotWindow
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          studentId={user?.id}
        />
      </Box>
    </Box>
  );
});

export default StudentLayout;
