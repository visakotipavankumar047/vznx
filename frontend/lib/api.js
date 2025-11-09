const API_BASE = process.env.VITE_BACKEND_LINK || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getProjects: () => request('/projects'),
  createProject: (payload) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (id, payload) =>
    request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateProjectProgress: (id, progress) =>
    request(`/projects/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    }),
  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: 'DELETE',
    }),
  getTasks: (projectId) => request(`/tasks/project/${projectId}`),
  createTask: (payload) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleTaskStatus: (taskId, status) =>
    request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateTask: (taskId, payload) =>
    request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTask: (taskId) =>
    request(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
  getTeamMembers: () => request('/team-members'),
  createTeamMember: (payload) =>
    request('/team-members', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTeamMember: (id, payload) =>
    request(`/team-members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTeamMember: (id) =>
    request(`/team-members/${id}`, {
      method: 'DELETE',
    }),
  getItems: () => request('/items'),
  getItem: (id) => request(`/items/${id}`),
  createItem: (payload) =>
    request('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateItem: (id, payload) =>
    request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteItem: (id) =>
    request(`/items/${id}`, {
      method: 'DELETE',
    }),
};
