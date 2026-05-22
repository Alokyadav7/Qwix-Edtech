const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = window.localStorage.getItem("sop-token");
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return { success: true };
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? "API request failed.");
  }

  return payload.data ?? payload;
}

export const authAPI = {
  login: (email, password) =>
    api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  register: (data) =>
    api("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  me: () => api("/auth/me"),
  logout: () => {
    window.localStorage.removeItem("sop-token");
    return Promise.resolve({ success: true });
  }
};

export const jobsAPI = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.kind) params.append("kind", filters.kind);
    if (filters.location) params.append("location", filters.location);
    if (filters.stipendMin) params.append("stipendMin", filters.stipendMin);
    if (filters.durationMax) params.append("durationMax", filters.durationMax);
    if (filters.workMode) params.append("workMode", filters.workMode);
    
    const query = params.toString();
    return api(`/opportunities${query ? `?${query}` : ""}`);
  },
  get: (id) => api(`/opportunities/${id}`),
  apply: (id, data) =>
    api(`/opportunities/${id}/apply`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
  save: (id) =>
    api(`/opportunities/${id}/save`, {
      method: "POST"
    }),
  getRecommended: () => api("/recommendations/jobs")
};

export const contestsAPI = {
  list: () => api("/contests"),
  get: (id) => api(`/contests/${id}`),
  register: (id) =>
    api(`/contests/${id}/register`, {
      method: "POST"
    }),
  submit: (id, problemId, code, language) =>
    api(`/contests/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ problemId, code, language })
    }),
  leaderboard: (id) => api(`/leaderboard/contest/${id}`)
};

export const interviewAPI = {
  start: (type, options = {}) =>
    api("/interviews/start", {
      method: "POST",
      body: JSON.stringify({ type, ...options })
    }),
  respond: (id, text) =>
    api(`/interviews/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ text })
    }),
  voiceRespond: (id, audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "response.webm");
    
    const token = window.localStorage.getItem("sop-token");
    return fetch(`${apiUrl}/interviews/${id}/voice-respond`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    }).then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message ?? "Voice submission failed");
      return payload.data ?? payload;
    });
  },
  end: (id) =>
    api(`/interviews/${id}/end`, {
      method: "POST"
    }),
  getHistory: () => api("/interviews/history"),
  getReport: (id) => api(`/interviews/${id}/report`)
};

export const testsAPI = {
  generate: (topic, options = {}) =>
    api("/ai-tests/generate", {
      method: "POST",
      body: JSON.stringify({ topic, ...options })
    }),
  get: (id) => api(`/ai-tests/${id}`),
  submit: (id, answers) =>
    api(`/ai-tests/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers })
    }),
  getHistory: () => api("/ai-tests/history"),
  getResults: (id) => api(`/ai-tests/${id}/results`)
};

export const resumeAPI = {
  list: () => api("/resumes"),
  create: (data) =>
    api("/resumes", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    api(`/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
  analyzeATS: (resumeId, jobDescription) =>
    api(`/resumes/${resumeId}/analyze-ats`, {
      method: "POST",
      body: JSON.stringify({ jobDescription })
    }),
  exportPDF: (resumeId, template = "ats-clean") => {
    const token = window.localStorage.getItem("sop-token");
    return fetch(`${apiUrl}/resumes/${resumeId}/pdf?template=${template}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to export PDF");
      return res.blob();
    });
  }
};

export const notificationsAPI = {
  list: () => api("/notifications"),
  markRead: (id) =>
    api(`/notifications/${id}/read`, {
      method: "POST"
    }),
  markAllRead: () =>
    api("/notifications/read-all", {
      method: "POST"
    })
};
