import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/donations/mine");
        setDonations(res.data);
      } catch (err) {
        setError("Failed to load your donations");
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>My Donations</h2>
      {user && <p>Logged in as {user.name} ({user.role})</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {donations.length === 0 && <p>No donations yet.</p>}

      <ul>
        {donations.map((d) => (
          <li key={d._id} style={{ marginBottom: 10 }}>
            <strong>{d.title}</strong> – {d.category} – {d.status}
            <br />
            <small>{d.quantity} item(s) – {d.pickupLocation}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
