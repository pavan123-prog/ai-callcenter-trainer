import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import API from "../services/api";

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState("");

  useEffect(() => {
    if (user.role !== "admin") {
      const userId = user._id || user.id;
      if (!userId) {
        setErrorSessions("User ID not found, cannot load feedback sessions.");
        return;
      }

      const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
          const res = await API.get(`/sessions/user/${userId}`);
          const sessionsWithFeedback = res.data.sessions.filter((s) => s.feedback);
          setSessions(sessionsWithFeedback);
        } catch (err) {
          setErrorSessions("Failed to load sessions");
        } finally {
          setLoadingSessions(false);
        }
      };

      fetchSessions();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={handleLogout} />

      <h1>Welcome, {user.name}</h1>
      <div className="dashboard-box">
        {user.role === "admin" ? (
          <>
            <h2> Admin Dashboard</h2>
            <ul>
              <li>Create & manage scenarios</li>
              <li>View CSR performance reports</li>
            </ul>
            <button onClick={() => navigate("/admin/scenarios")}>Manage Scenarios</button>
            <button onClick={() => navigate("/admin/performance")}>View CSR Performance</button>
          </>
        ) : (
          <>
            <h2>👨‍💼 CSR Dashboard</h2>
              <button onClick={() => navigate("/chat")}> Start Chat</button>
              <button onClick={() => navigate("/feedback-history")}> Feedback History</button>
            

            {loadingSessions && <p>Loading feedback sessions...</p>}
            {errorSessions && <p style={{ color: "red" }}>{errorSessions}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
