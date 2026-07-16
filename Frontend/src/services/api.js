const API_BASE_URL = "http://localhost:3000/api";

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
};
