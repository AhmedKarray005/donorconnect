import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function Register() {
  const { register } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    address: "",
    organizationName: "",
    mission: "",
    city: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      const msg = "Name, email and password are required.";
      setError(msg);
      notify(msg, "error");
      return;
    }

    if (form.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      notify(msg, "error");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    };

    if (form.role === "donor") {
      payload.address = form.address;
      if (!form.address) {
        const msg = "Address is required for donors.";
        setError(msg);
        notify(msg, "error");
        return;
      }
    } else if (form.role === "npo") {
      payload.organizationName = form.organizationName;
      payload.mission = form.mission;
      payload.city = form.city;
      if (!form.organizationName || !form.mission || !form.city) {
        const msg = "All organisation fields are required for NPOs.";
        setError(msg);
        notify(msg, "error");
        return;
      }
    }

    setSubmitting(true);

    try {
      await register(
        payload.name,
        payload.email,
        payload.password,
        payload.role,
        payload
      );

      notify("Account created. Please log in.", "success");
      navigate("/login");
    } catch (err) {
      const msg = "Registration failed";
      setError(msg);
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const isDonor = form.role === "donor";
  const isNpo = form.role === "npo";

  return (
    <div className="auth-wrapper">
      <h2 className="page-title">Create your account</h2>
      <p className="page-subtitle">
        Choose whether you want to publish donations (Donor) or request them
        (NPO).
      </p>

      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
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
          <p className="form-help">At least 6 characters.</p>
        </div>

        <div className="form-field">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="donor">Donor</option>
            <option value="npo">NPO</option>
          </select>
        </div>

        {isDonor && (
          <div className="form-field">
            <label>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Where donations will be picked up"
              required
            />
          </div>
        )}

        {isNpo && (
          <>
            <div className="form-field">
              <label>Organization name</label>
              <input
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Mission</label>
              <input
                name="mission"
                value={form.mission}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account…" : "Register"}
        </button>

        <p className="form-help">
          Already registered?{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
          .
        </p>
      </form>
    </div>
  );
}
