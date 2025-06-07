import React, { useState, useRef, useEffect } from "react";
import { data, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Sidebar from "./Dashboard/Sidebar"; // Import the Sidebar
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "./StudentLayout.css";

const ChatbotWindow = ({ isOpen, onClose, studentId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (isOpen && !isInitialized) {
      // Initialize chatbot with student ID
      fetch("http://127.0.0.1:5000/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_id: studentId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setIsInitialized(true);
            setMessages([
              {
                type: "bot",
                response: { type: "text", content: data.message },
              },
            ]);
          }
        })
        .catch((error) => {
          console.error("Error initializing chatbot:", error);
        });
    }
  }, [isOpen, isInitialized, studentId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: inputMessage }]);

    // Send message to chatbot
    fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: inputMessage }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            { type: "bot", response: data.response },
          ]);
        }
      })
      .catch((error) => {
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
      });

    setInputMessage("");
  };

  const renderResponse = (response) => {
    if (!response || !response.type) {
      return <div className="message-content error-message">{response}</div>;
    }

    switch (response.type) {
      case "text":
        return <div className="message-content">{response.content}</div>;

      case "table":
        // Extract structured data
        const formattedTableData = response.data.map((row) => {
          const rowData = {};
          response.headers.forEach((header) => {
            rowData[header.toLowerCase()] = row[header.toLowerCase()];
          });
          return rowData;
        });

        console.log("Formatted Table Data:", formattedTableData); // You can remove or replace this

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
                  {formattedTableData.map((data) => (
                    <tr>
                      {response.headers.map((header, index) => (
                        <td className="w-100" key={index}>{data[header.toLowerCase()]}</td>
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
                  <span className="announcement-date">{announcement.date}</span>
                </div>
                <div className="announcement-body">{announcement.content}</div>
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
                            <span className="session-time">{session.time}</span>
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
  };

  return (
    <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
      <div className="chatbot-header">
        <h3>College Assistant</h3>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>
      <div className="chatbot-messages">
        <div className={`message text`}>
          <div className="message-content">
            <strong>Welcome to the College Assistant Chatbot!</strong>
            <p>
              You can ask about:
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
            </p>
          </div>
        </div>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === "user" ? (
              <div className="message-content">{message.content}</div>
            ) : (
              renderResponse(message?.response)
            )}
          </div>
        ))}
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
};

const StudentLayout = () => {
  const [open, setOpen] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { user } = useAuth();

  const handleDrawerClose = () => {
    setOpen(false); // Close drawer when button is clicked
  };

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
        <button
          className="chatbot-button"
          onClick={() => setIsChatbotOpen(true)}
        >
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
};

export default StudentLayout;
