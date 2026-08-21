import { createContext, useContext, useState, useCallback } from "react";
import { api, setAuthToken } from "../api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "messboard_auth";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = loadStored();
    if (stored?.accessToken) setAuthToken(stored.accessToken);
    return stored;
  });

  const persist = useCallback((data) => {
    setAuth(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAuthToken(data.accessToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  }, []);

  const loginStudent = useCallback(
    async (rollNumber, password) => {
      const data = await api.studentLogin({ rollNumber, password });
      persist(data);
      return data;
    },
    [persist]
  );

  const registerStudent = useCallback(
    async (payload) => {
      const data = await api.studentRegister(payload);
      persist(data);
      return data;
    },
    [persist]
  );

  const loginAdmin = useCallback(
    async (username, password) => {
      const data = await api.adminLogin({ username, password });
      persist(data);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider value={{ auth, loginStudent, registerStudent, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
