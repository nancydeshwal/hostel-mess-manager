import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import StudentView from "./components/StudentView.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import MenuManager from "./components/MenuManager.jsx";
import LoginPage from "./components/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function NavTab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `focus-ring px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-colors ${
          isActive
            ? "bg-mango-500 text-steel-950"
            : "text-steel-300 hover:text-steel-100 hover:bg-steel-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function HeaderNav() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center gap-2">
      {auth?.role === "student" && <NavTab to="/">Student</NavTab>}
      {auth?.role === "admin" && <NavTab to="/admin">Dashboard</NavTab>}
      {auth?.role === "admin" && <NavTab to="/admin/menu">Menu</NavTab>}
      {auth ? (
        <button
          onClick={handleLogout}
          className="focus-ring ml-2 px-4 py-2 rounded-full text-sm font-medium tracking-wide text-steel-400 hover:text-chili-500 hover:bg-steel-800 transition-colors"
        >
          {auth.name ? `Log out (${auth.name.split(" ")[0]})` : "Log out"}
        </button>
      ) : (
        <NavTab to="/login">Log in</NavTab>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-steel-800 sticky top-0 z-20 bg-steel-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-wide text-mango-400">
              MESS BOARD
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-steel-500">
              NIT Kurukshetra
            </span>
          </div>
          <HeaderNav />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute role="student">
                <StudentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute role="admin">
                <MenuManager />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-steel-800 py-6 text-center text-xs text-steel-500">
        Built for hostel mess menu tracking, meal-skip signalling, and waste-reduction analytics.
      </footer>
    </div>
  );
}
