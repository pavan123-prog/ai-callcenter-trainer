import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Header from './Header';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);

  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await API.get("/scenarios");
        setScenarios(res.data);
      } catch (err) {
        console.error("Error fetching scenarios:", err);
      }
    };
    fetchScenarios();
  }, []);

  const startChat = async () => {
    if (!selectedScenario) {
      alert("Please select a scenario first.");
      return;
    }

    try {
      const res = await API.post("/chat/start", { scenarioId: selectedScenario });
      setMessages(res.data.messages || []);
      setSessionId(res.data._id);
      setChatEnded(false);
      setInput("");
      setFeedbackReady(false);
    } catch (err) {
      console.error("Error starting chat", err);
    }
  };

  const sendMessage = async () => {
    if (!input || !sessionId) return;
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await API.post(`/chat/${sessionId}/message`, { message: input });
      setMessages(res.data.session.messages || []);
      setInput("");
    } catch (err) {
      console.error("Error sending message", err);
    }

    setLoading(false);
    setIsTyping(false);
  };

  const endChat = async () => {
    if (!sessionId || sessionId === "undefined") {
      console.error("Session ID is undefined, cannot end chat.");
      alert("Chat session did not initialize properly. Please try again.");
      return;
    }

    setChatEnded(true);
    setCheckingFeedback(true);

    try {
      console.log("Generating feedback for session:", sessionId);
      await API.post(`/feedback/${sessionId}`);

      // Poll feedback until ready
      const pollFeedback = async (attempt = 0) => {
        try {
          const res = await API.get(`/feedback/${sessionId}`);
          if (res.status === 200) {
            setFeedbackReady(true);
            setCheckingFeedback(false);
          } else if (attempt < 5) {
            setTimeout(() => pollFeedback(attempt + 1), 1500);
          } else {
            setCheckingFeedback(false);
          }
        } catch (err) {
          if (attempt < 5) {
            setTimeout(() => pollFeedback(attempt + 1), 1500);
          } else {
            setCheckingFeedback(false);
          }
        }
      };

      pollFeedback();
    } catch (err) {
      console.error("Error ending chat", err);
      alert("Failed to generate feedback. Please try again.");
    }
  };

  const goToFeedback = () => {
    if (sessionId) {
      navigate(`/feedback/${sessionId}`);
    } else {
      alert("No valid session ID found.");
    }
  };

  return (
    <div><Header user={user} onLogout={onLogout} />
    <div className="chat-container">
      <h2>🤖 AI Call Center Chat</h2>

      <div className="chat-scenario">
        <label>Select Scenario:</label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          disabled={!!sessionId && !chatEnded}
        >
          <option value="">-- Choose Scenario --</option>
          {scenarios.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title}
            </option>
          ))}
        </select>
        <button onClick={startChat} disabled={!selectedScenario || (!!sessionId && !chatEnded)}>
          Start Chat
        </button>
      </div>

      <div className="chat-box">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.sender}`}>
              <div className="bubble">
                <strong>{msg.sender === "csr" ? "You" : "Customer"}:</strong> {msg.text}
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet. Start a chat session.</p>
        )}
        {isTyping && <p className="typing-indicator">Customer is typing...</p>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply..."
          disabled={!sessionId || chatEnded}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && sessionId && !chatEnded) {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={loading || !sessionId || chatEnded}>
          {loading ? "Sending..." : "Send"}
        </button>

        {!chatEnded && sessionId && (
          <button
            className="end-btn"
            onClick={endChat}
            style={{ marginLeft: "10px", backgroundColor: "#e63946", color: "#fff" }}
          >
            End Chat
          </button>
        )}

        {chatEnded && (
          <button
            className="feedback-btn"
            onClick={goToFeedback}
            disabled={!feedbackReady || checkingFeedback}
            style={{ marginLeft: "10px", backgroundColor: "#2a9d8f", color: "#fff" }}
          >
            {checkingFeedback ? "Preparing Feedback..." : "Go to Feedback"}
          </button>
        )}
      </div>
    </div>
    </div>
  );
};

export default Chat;
