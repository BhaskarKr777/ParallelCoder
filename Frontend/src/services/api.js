/*
  Relative on purpose: the backend serves the built frontend from
  the same origin in production, and the Vite dev proxy forwards
  /api to the backend in dev (see vite.config.js). A hardcoded
  http://localhost:3000 here would only ever work on a developer's
  own machine.
*/
const API_BASE_URL = "/api";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  logoutAll: () => request("/auth/logout-all", { method: "POST" }),

  me: () => request("/auth/me"),

  googleUrl: `${API_BASE_URL}/auth/google`,
  githubUrl: `${API_BASE_URL}/auth/github`,
};

export const workspaceApi = {
  list: () => request("/workspaces"),

  create: (payload) =>
    request("/workspaces", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  get: (workspaceId) => request(`/workspaces/${workspaceId}`),

  members: (workspaceId) => request(`/workspaces/${workspaceId}/members`),

  inviteMember: (workspaceId, payload) =>
    request(`/workspaces/${workspaceId}/members`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createInvite: (workspaceId, role) =>
    request(`/workspaces/${workspaceId}/invites`, {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  acceptInvite: (code) =>
    request("/workspaces/invites/accept", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  updateMemberRole: (workspaceId, memberId, role) =>
    request(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  removeMember: (workspaceId, memberId) =>
    request(`/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" }),
};

export const filesApi = {
  list: (workspaceId) => request(`/workspaces/${workspaceId}/files`),

  create: (workspaceId, payload) =>
    request(`/workspaces/${workspaceId}/files`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (fileId, payload) =>
    request(`/files/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (fileId) => request(`/files/${fileId}`, { method: "DELETE" }),
};
