import React, { useState } from 'react';
import API from '../services/api';

function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('csr'); // default role
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        onLogin(res.data.user);
      } else {
        await API.post('/auth/register', { name, email, password, role });
        alert('Registered successfully! Please login.');
        setMode('login'); // switch to login after registration
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? '🔐 AI Call Center Login' : '📝 Register New User'}</h2>

        {mode === 'register' && (
          <>
            <input
              type="text"
              placeholder="👤 Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="csr">CSR</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>

        <p className="toggle-text">
          {mode === 'login' ? 'New user?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
