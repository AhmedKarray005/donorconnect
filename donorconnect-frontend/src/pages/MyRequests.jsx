import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const res = await api.get("/requests");
      setRequests(res.data);
    } catch (err) {
      setError("Failed to load requests");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id, action) {
    try {
      setBusyId(id);
      await api.patch(`/requests/${id}/${action}`);
      await load();
    } catch (err) {
      console.error(err);
      setError("Action failed");
    } finally {
      setBusyId(null);
    }
  }

  const isDonor = user?.role === "donor";
  const isNpo = user?.role === "npo";

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>My Pickup Requests</h2>
      {user && (
        <p>
          Logged in as <strong>{user.name}</strong> ({user.role})
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {requests.length === 0 && <p>No requests.</p>}

      <ul>
        {requests.map((r) => (
          <li key={r._id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <strong>{r.donation?.title}</strong> – status: {r.status}
            <br />
            <small>
              Pickup location: {r.donation?.pickupLocation} <br />
              Message: {r.message || "-"} <br />
              Scheduled:{" "}
              {r.scheduledDate
                ? new Date(r.scheduledDate).toLocaleString()
                : "not set"}
            </small>

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {isDonor && r.status === "pending" && (
                <>
                  <button
                    disabled={busyId === r._id}
                    onClick={() => handleAction(r._id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    disabled={busyId === r._id}
                    onClick={() => handleAction(r._id, "reject")}
                  >
                    Reject
                  </button>
                </>
              )}

              {isNpo && r.status === "pending" && (
                <button
                  disabled={busyId === r._id}
                  onClick={() => handleAction(r._id, "cancel")}
                >
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
