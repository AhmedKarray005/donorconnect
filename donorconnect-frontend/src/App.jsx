import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DonationsList from "./pages/DonationsList.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import CreateDonation from "./pages/CreateDonation.jsx";
import MyDonations from "./pages/MyDonations.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Landing from "./pages/Landing.jsx";
import { useAuth } from "./AuthContext.jsx";

function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (pattern) => {
    if (pattern === "/") return path === "/";
    return path.startsWith(pattern);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand" onClick={() => navigate("/")}>
            <div className="brand-logo">DC</div>
            <div className="brand-text">
              <span className="brand-title">DonorConnect</span>
              <span className="brand-sub">Structured physical donations</span>
            </div>
          </div>

          <nav className="app-nav">
            <button
              className={
                "btn btn-outline nav-link " +
                (isActive("/") ? "nav-link--active" : "")
              }
              onClick={() => navigate("/")}
            >
              Overview
            </button>

            {user && (
              <>
                <button
                  className={
                    "btn btn-outline nav-link " +
                    (isActive("/donations") ? "nav-link--active" : "")
                  }
                  onClick={() => navigate("/donations")}
                >
                  Donations
                </button>
                <button
                  className={
                    "btn btn-outline nav-link " +
                    (isActive("/my-requests") ? "nav-link--active" : "")
                  }
                  onClick={() => navigate("/my-requests")}
                >
                  My requests
                </button>
                {user.role === "donor" && (
                  <button
                    className={
                      "btn btn-outline nav-link " +
                      (isActive("/my-donations") ? "nav-link--active" : "")
                    }
                    onClick={() => navigate("/my-donations")}
                  >
                    My donations
                  </button>
                )}
                <span className="badge">
                  {user.name} · {user.role}
                </span>
                <button className="btn btn-outline" onClick={logout}>
                  Logout
                </button>
              </>
            )}

            {!user && (
              <>
                <button
                  className={
                    "btn btn-outline nav-link " +
                    (isActive("/login") ? "nav-link--active" : "")
                  }
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className={
                    "btn btn-primary " +
                    (isActive("/register") ? "nav-link--active" : "")
                  }
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <DonationsList />
            </ProtectedRoute>
          }
        />

        {/* You can keep this route as a fallback if you want */}
        <Route
          path="/donations/new"
          element={
            <ProtectedRoute>
              <CreateDonation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-donations"
          element={
            <ProtectedRoute>
              <MyDonations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
