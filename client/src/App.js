import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Chat from './components/chat';
import Feedback from './components/feedback';
import AdminScenarios from './components/AdminScenarios';
import AdminPerformance from './components/AdminPerformance';
import FeedbackHistory from "./components/FeedbackHistory"; 

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard user={user} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/chat"
          element={user ? <Chat user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/feedback"
          element={user ? <Feedback user={user} /> : <Navigate to="/" />}
        />
        <Route
  path="/feedback/:sessionId"
  element={user ? <Feedback user={user} /> : <Navigate to="/" />}
/>
<Route path="/feedback-history" element={<FeedbackHistory />} />

        <Route
          path="/admin/scenarios"
          element={user?.role === 'admin' ? <AdminScenarios /> : <Navigate to="/" />}
        />
<Route
  path="/dashboard"
  element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
/>


        <Route
          path="/admin/performance"
          element={user?.role === 'admin' ? <AdminPerformance /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
