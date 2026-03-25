const BASE_URL = process.env.REACT_APP_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getConferences: () => request('/conferences'),
  getConference: (id) => request(`/conferences/${id}`),
  getMyConferences: () => request('/conferences/my/list'),
  createConference: (body) => request('/conferences', { method: 'POST', body: JSON.stringify(body) }),
  updateConference: (id, body) => request(`/conferences/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteConference: (id) => request(`/conferences/${id}`, { method: 'DELETE' }),
  register_conference: (id) => request(`/registrations/${id}`, { method: 'POST' }),
  unregister_conference: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),
  getMyRegistrations: () => request('/registrations/my/list'),
  checkRegistration: (id) => request(`/registrations/check/${id}`),
};
