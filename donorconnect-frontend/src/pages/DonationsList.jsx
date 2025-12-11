// src/pages/DonationsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function DonationsList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isDonor = user?.role === "donor";
  const isNpo = user?.role === "npo";

  async function loadDonations() {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/donations");
      // backend returns { data, page, ... } or simple array
      const items = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDonations(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

   async function requestPickup(donationId) {
    const message = window.prompt("Message to donor (required):", "");
    if (!message || !message.trim()) {
      alert("Message is required.");
      return;
    }

    const dateStr = window.prompt(
      "Pickup date (YYYY-MM-DD, required, must be ≥ available date):",
      ""
    );
    if (!dateStr || !dateStr.trim()) {
      alert("Pickup date is required.");
      return;
    }

    try {
      await api.post("/requests", {
        donationId,
        message: message.trim(),
        scheduledDate: dateStr.trim()
      });
      alert("Pickup request sent.");
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data?.error) {
        alert("Failed: " + data.error);
      } else if (data?.fields) {
        alert("Failed: " + Object.values(data.fields).join(" - "));
      } else {
        alert("Failed to create request.");
      }
    }
  }


  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <div>
          <h2>Donations</h2>
          {user && (
            <p>
              Logged in as <strong>{user.name}</strong> ({user.role})
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {isDonor && (
            <>
              <button onClick={() => navigate("/donations/new")}>
                New Donation
              </button>
              <button onClick={() => navigate("/my-donations")}>
                My Donations
              </button>
            </>
          )}

          <button onClick={() => navigate("/my-requests")}>
            My Requests
          </button>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {loading && <p>Loading donations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && donations.length === 0 && <p>No donations found.</p>}

      <ul>
        {donations.map((d) => (
          <li
            key={d._id}
            style={{
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: "1px solid #ddd"
            }}
          >
            <strong>{d.title}</strong> – {d.category} – {d.status}
            <br />
            <small>
              {d.quantity} item(s) – {d.pickupLocation}
              {d.availableDate && (
                <>
                  {" "}
                  – available from{" "}
                  {new Date(d.availableDate).toLocaleDateString()}
                </>
              )}
            </small>

            {d.imageUrl && (
              <div style={{ marginTop: 5 }}>
                <img
                  src={`http://localhost:3000${d.imageUrl}`}
                  alt={d.title}
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: 4
                  }}
                />
              </div>
            )}

            {isNpo && d.status === "Open" && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => requestPickup(d._id)}>
                  Request pickup
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
