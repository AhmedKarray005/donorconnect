import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      const msg = "Email and password are required.";
      setError(msg);
      notify(msg, "error");
      return;
    }

    setSubmitting(true);

    try {
      await login(form.email, form.password);
      notify("Welcome back.", "success");
      navigate("/donations");
    } catch (err) {
      const msg = "Invalid email or password";
      setError(msg);
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <h2 className="page-title">Login</h2>
      <p className="page-subtitle">
        Access your donor or NPO dashboard and manage your items and requests.
      </p>

      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.org"
          />
        </div>

        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Login"}
        </button>

        <p className="form-help">
          No account yet?{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
          .
        </p>
      </form>
    </div>
  );
}
