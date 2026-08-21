import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import HostelSelect from "./HostelSelect.jsx";

export default function LoginPage() {
  const [tab, setTab] = useState("student"); // "student" | "admin"
  const [mode, setMode] = useState("login"); // "login" | "register" (student only)
  const navigate = useNavigate();
  const { loginStudent, registerStudent, loginAdmin } = useAuth();

  // student login/register fields
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [hostelId, setHostelId] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");

  // admin fields
  const [username, setUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleStudentLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginStudent(rollNumber, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentRegister(e) {
    e.preventDefault();
    setError(null);
    if (!hostelId) {
      setError("Pick your hostel first.");
      return;
    }
    setLoading(true);
    try {
      await registerStudent({ name, rollNumber, password, hostelId, roomNumber });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAdmin(username, adminPassword);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="font-display text-3xl text-mango-400 tracking-wide">MESS BOARD</p>
          <p className="text-xs uppercase tracking-[0.2em] text-steel-500 mt-1">NIT Kurukshetra</p>
        </div>

        <div className="flex rounded-full bg-steel-900 border border-steel-800 p-1 mb-6">
          <TabButton active={tab === "student"} onClick={() => { setTab("student"); setError(null); }}>
            Student
          </TabButton>
          <TabButton active={tab === "admin"} onClick={() => { setTab("admin"); setError(null); }}>
            Admin
          </TabButton>
        </div>

        {tab === "student" ? (
          <div className="rounded-2xl border border-steel-800 bg-steel-900 p-6 flex flex-col gap-4">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`focus-ring pb-1 border-b-2 ${mode === "login" ? "border-mango-500 text-steel-100" : "border-transparent text-steel-500"}`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`focus-ring pb-1 border-b-2 ${mode === "register" ? "border-mango-500 text-steel-100" : "border-transparent text-steel-500"}`}
              >
                New here? Register
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleStudentLogin} className="flex flex-col gap-3">
                <Field label="Student ID (roll number)" value={rollNumber} onChange={setRollNumber} autoFocus />
                <Field label="Password" type="password" value={password} onChange={setPassword} />
                <SubmitButton loading={loading}>Log in</SubmitButton>
              </form>
            ) : (
              <form onSubmit={handleStudentRegister} className="flex flex-col gap-3">
                <Field label="Full name" value={name} onChange={setName} autoFocus />
                <Field label="Student ID (roll number)" value={rollNumber} onChange={setRollNumber} />
                <Field label="Password (min 6 characters)" type="password" value={password} onChange={setPassword} />
                <Field label="Room number (optional)" value={roomNumber} onChange={setRoomNumber} required={false} />
                <label className="flex flex-col gap-1 text-xs text-steel-400">
                  Hostel
                  <HostelSelect value={hostelId} onChange={setHostelId} />
                </label>
                <SubmitButton loading={loading}>Create account</SubmitButton>
              </form>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-steel-800 bg-steel-900 p-6 flex flex-col gap-4">
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
              <Field label="Username" value={username} onChange={setUsername} autoFocus />
              <Field label="Password" type="password" value={adminPassword} onChange={setAdminPassword} />
              <SubmitButton loading={loading}>Log in as admin</SubmitButton>
            </form>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-chili-500 text-center bg-chili-600/10 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring flex-1 rounded-full py-2 text-sm font-medium tracking-wide transition-colors ${
        active ? "bg-mango-500 text-steel-950" : "text-steel-400 hover:text-steel-100"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", autoFocus = false, required = true }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-steel-400">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        required={required}
        className="focus-ring bg-steel-800 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100"
      />
    </label>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="focus-ring mt-1 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide bg-mango-500 text-steel-950 hover:bg-mango-400 disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
