const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // auth
  studentRegister: (data) => request("/api/auth/student/register", { method: "POST", body: JSON.stringify(data) }),
  studentLogin: (data) => request("/api/auth/student/login", { method: "POST", body: JSON.stringify(data) }),
  adminLogin: (data) => request("/api/auth/admin/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/api/auth/me"),

  // hostels
  listHostels: () => request("/api/hostels"),
  createHostel: (data) => request("/api/hostels", { method: "POST", body: JSON.stringify(data) }),
  listStudents: (hostelId) => request(`/api/hostels/${hostelId}/students`),
  addStudent: (hostelId, data) =>
    request(`/api/hostels/${hostelId}/students`, { method: "POST", body: JSON.stringify(data) }),

  // menu
  getMenu: (hostelId, date) => request(`/api/menu?hostelId=${hostelId}&date=${date}`),
  upsertMenu: (data) => request("/api/menu", { method: "POST", body: JSON.stringify(data) }),
  getMenuRange: (hostelId, start, end) =>
    request(`/api/menu/range?hostelId=${hostelId}&start=${start}&end=${end}`),

  // skips
  toggleSkip: (data) => request("/api/skips", { method: "POST", body: JSON.stringify(data) }),
  getSkipStatus: (studentId, date, mealType) =>
    request(`/api/skips?studentId=${studentId}&date=${date}&mealType=${mealType}`),

  // complaints
  createComplaint: (data) => request("/api/complaints", { method: "POST", body: JSON.stringify(data) }),
  listComplaints: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/complaints${qs ? `?${qs}` : ""}`);
  },
  updateComplaintStatus: (id, status) =>
    request(`/api/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // analytics
  getSkipSummary: (hostelId, days = 14) =>
    request(`/api/analytics/skip-summary?hostelId=${hostelId}&days=${days}`),
  getComplaintSummary: (hostelId, days = 30) =>
    request(`/api/analytics/complaint-summary?hostelId=${hostelId}&days=${days}`),
  predictGrocery: (hostelId, mealType, historyDays = 21) =>
    request(
      `/api/analytics/predict-grocery?hostelId=${hostelId}&mealType=${mealType}&history_days=${historyDays}`
    ),
};
