import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function FeedbackHistory() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser._id) {
      setError("User ID not found in localStorage.");
      return;
    }

    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/sessions/user/${storedUser._id}`);
        const sessionsWithFeedback = res.data.sessions.filter((s) => s.feedback);
        setFeedbacks(sessionsWithFeedback);
      } catch (err) {
        console.error("Failed to load feedback history", err);
        setError("Failed to load feedback history.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="feedback-history">
      <h2>📋 Feedback History</h2>
      <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {feedbacks.length === 0 ? (
        <p>No feedback history found.</p>
      ) : (
        <ul>
          {feedbacks.map((session) => (
            <li
              key={session._id}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px",
              }}
            >
              <p><strong>Date:</strong> {new Date(session.endedAt).toLocaleString()}</p>
              <p><strong>Scenario:</strong> {session.scenario?.title || "N/A"}</p>
              <p><strong>Score:</strong> {session.feedback?.score || "N/A"}/10</p>
              <p><strong>Tone:</strong> {session.feedback?.tone || "N/A"}</p>
              <p><strong>Empathy:</strong> {session.feedback?.empathy || "N/A"}</p>
              <p><strong>Resolution:</strong> {session.feedback?.resolution || "N/A"}</p>
              <p><strong>Escalation:</strong> {session.feedback?.escalation || "N/A"}</p>
              <p><strong>Suggestions:</strong> {session.feedback?.suggestions || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FeedbackHistory;
