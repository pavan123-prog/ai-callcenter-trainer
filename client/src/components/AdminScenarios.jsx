import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from './Header';

function AdminScenarios({ user, onLogout }) {
  const [scenarios, setScenarios] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/scenarios');
      setScenarios(res.data);
    } catch (err) {
      console.error("Error loading scenarios", err);
    }
  };

  const createScenario = async () => {
    if (!title || !description) return alert("Fill all fields");
    await api.post('/scenarios', { title, description });
    setTitle('');
    setDescription('');
    fetchScenarios();
  };

  const deleteScenario = async (id) => {
    await api.delete(`/scenarios/${id}`);
    fetchScenarios();
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  return (
    <div>
      <Header user={user} onLogout={onLogout} />

      <div className="p-6">
        <h2>Scenario Management</h2>
        <div>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button onClick={createScenario}>Add</button>
        </div>
        <ul>
          {scenarios.map(s => (
            <li key={s._id}>
              <b>{s.title}</b>: {s.description}
              <button onClick={() => deleteScenario(s._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminScenarios;
