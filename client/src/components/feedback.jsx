import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Header from './Header';

const Feedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  // ✅ Fix: Load user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [feedbackRes, sessionRes] = await Promise.all([
          API.get(`/feedback/${sessionId}`),
          API.get(`/sessions/${sessionId}`)
        ]);

        setFeedback(feedbackRes.data.feedback);
        setSession(sessionRes.data);
      } catch (err) {
        console.error("❌ Error loading feedback or session:", err);
        setError("Unable to load feedback or session");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  if (loading) return <p>Loading feedback...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <div className="feedback-container">
        <h2>📝 Session Feedback</h2>

        {feedback?.score !== undefined && (
          <div className="feedback-score">
            <strong>Overall Score:</strong> {feedback.score}/10
          </div>
        )}

        {Array.isArray(feedback?.strengths) && feedback.strengths.length > 0 && (
          <div className="feedback-section">
            <h3>✅ Strengths</h3>
            <ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}

        {Array.isArray(feedback?.suggestions) && feedback.suggestions.length > 0 && (
          <div className="feedback-section">
            <h3>🛠️ Suggestions</h3>
            <ul>{feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}

        {Array.isArray(feedback?.flags) && feedback.flags.length > 0 && (
          <div className="feedback-section">
            <h3>🚩 Flags</h3>
            <ul>{feedback.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}

        {feedback?.raw && (
          <div className="feedback-raw">
            <h3>🧠 Full Evaluation</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{feedback.raw}</pre>
          </div>
        )}

        {session?.messages?.length > 0 && (
          <>
            <button onClick={() => setShowTranscript(prev => !prev)} style={{ margin: "1em 0" }}>
              {showTranscript ? "🙈 Hide Transcript" : "📄 Show Transcript"}
            </button>

            {showTranscript && (
              <div className="feedback-transcript">
                <h3>🗣️ Chat Transcript</h3>
                <div style={{ border: "1px solid #ccc", padding: "1em", borderRadius: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {session.messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: "0.5em" }}>
                      <strong>{msg.sender === "csr" ? "CSR" : "Customer"}:</strong> {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button onClick={() => navigate("/dashboard")}>🔙 Back to Dashboard</button>
      </div>
    </div>
  );
};

export default Feedback;
