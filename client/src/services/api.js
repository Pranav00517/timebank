const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('timebank_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // User Profile
  getMe: () => request('/users/me'),
  updateProfile: (body) => request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => request('/users/change-password', { method: 'POST', body: JSON.stringify(body) }),
  getPublicProfile: (id) => request(`/users/${id}/public`),

  // Listings
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.mode && params.mode !== 'all') query.append('mode', params.mode);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    return request(`/listings?${query.toString()}`);
  },
  getListingById: (id) => request(`/listings/${id}`),
  createListing: (body) => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  updateListing: (id, body) => request(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  getMyListings: () => request('/listings/my/all'),

  // Sessions
  requestSession: (body) => request('/sessions', { method: 'POST', body: JSON.stringify(body) }),
  acceptSession: (id) => request(`/sessions/${id}/accept`, { method: 'PATCH' }),
  declineSession: (id) => request(`/sessions/${id}/decline`, { method: 'PATCH' }),
  cancelSession: (id) => request(`/sessions/${id}/cancel`, { method: 'PATCH' }),
  confirmSession: (id) => request(`/sessions/${id}/confirm`, { method: 'PATCH' }),
  reportDispute: (id, body) => request(`/sessions/${id}/dispute`, { method: 'PATCH', body: JSON.stringify(body) }),
  reviewSession: (id, body) => request(`/sessions/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
  getInboxSessions: () => request('/sessions/inbox'),
  getMySessions: () => request('/sessions/my'),

  // Credits
  getCreditHistory: (page = 1, limit = 10) => request(`/credits/history?page=${page}&limit=${limit}`),

  // Admin
  listUsers: (page = 1, limit = 20) => request(`/admin/users?page=${page}&limit=${limit}`),
  toggleSuspendUser: (id, body = {}) => request(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify(body) }),
  listAllListings: () => request('/admin/listings'),
  moderateListing: (id, body) => request(`/admin/listings/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(body) }),
  getDisputedSessions: () => request('/admin/sessions/disputed'),
  resolveDispute: (id, body) => request(`/admin/sessions/${id}/resolve`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminLogs: () => request('/admin/logs'),
};
