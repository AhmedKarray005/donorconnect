import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = { 
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      if (form.role === "donor") {
        payload.address = form.address;
      } else if (form.role === "npo") {
        payload.organizationName = form.organizationName;
        payload.mission = form.mission;
        payload.city = form.city;
      }

      await register(
        payload.name,
        payload.email,
        payload.password,
        payload.role,
        payload // we modify register() next
      );

      navigate("/login");
    } catch (err) {
      setError("Registration failed");
    }
  }

  const isDonor = form.role === "donor";
  const isNpo = form.role === "npo";

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label><br />
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Email</label><br />
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Password</label><br />
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Role</label><br />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="donor">Donor</option>
            <option value="npo">NPO</option>
          </select>
        </div>

        {isDonor && (
          <div style={{ marginTop: 10 }}>
            <label>Address</label><br />
            <input name="address" value={form.address} onChange={handleChange} required />
          </div>
        )}

        {isNpo && (
          <>
            <div style={{ marginTop: 10 }}>
              <label>Organization Name</label><br />
              <input
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <label>Mission</label><br />
              <input
                name="mission"
                value={form.mission}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <label>City</label><br />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <button style={{ marginTop: 15 }} type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
