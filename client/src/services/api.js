// client/src/services/api.js

import axios from 'axios';

// ✅ Axios instance setup
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 🔁 Update this for production deployment
});

// ✅ Automatically attach JWT token to headers if present
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 🔁 NOTE: In Chat.jsx, use this API instance to call:
// await API.post('/chat/start', { scenarioId: selectedScenario })

export default API;
