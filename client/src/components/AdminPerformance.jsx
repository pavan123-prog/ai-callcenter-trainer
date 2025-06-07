import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from './Header';

function AdminPerformance({ user, onLogout }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/sessions')
      .then(res => setSessions(res.data))
      .catch(err => console.error("Failed to load sessions", err));
  }, []);

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <div className="p-6">
        <h2>CSR Performance Reports</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>CSR</th>
              <th>Scenario</th>
              <th>Score</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s._id}>
                <td>{s.csr?.name}</td>
                <td>{s.scenario?.title}</td>
                <td>{s.feedback?.score || 'N/A'}</td>
                <td>
                  {Array.isArray(s.feedback?.suggestions)
                    ? s.feedback.suggestions.join(', ')
                    : s.feedback?.suggestions || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPerformance;
