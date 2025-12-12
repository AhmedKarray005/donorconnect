import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function MyRequests() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [confirm, setConfirm] = useState(null);
  // confirm = { id, action, title, description }

  async function load() {
    try {
      const res = await api.get("/requests");
      setRequests(res.data || []);
    } catch (err) {
      setError("Failed to load requests");
      notify("Could not load requests.", "error");
    }
  }

  useEffect(() => {
    load();
  }, [notify]);

  async function handleAction(id, action) {
    try {
      setBusyId(id);
      await api.patch(`/requests/${id}/${action}`);
      await load();

      if (action === "accept") {
        notify("Request accepted.", "success");
      } else if (action === "reject") {
        notify("Request rejected.", "info");
      } else if (action === "cancel") {
        notify("Request cancelled.", "info");
      }
    } catch (err) {
      console.error(err);
      setError("Action failed");
      notify("Could not update this request.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function openConfirm(id, action, donationTitle) {
    let title = "";
    let description = "";

    if (action === "accept") {
      title = "Confirm acceptance";
      description = `This will confirm the pickup request for "${donationTitle}". The NGO will see the request as ACCEPTED.`;
    } else if (action === "reject") {
      title = "Confirm rejection";
      description = `This will reject the pickup request for "${donationTitle}". The NGO will see this request as REJECTED.`;
    } else if (action === "cancel") {
      title = "Cancel this request?";
      description = `You are about to cancel your pickup request for "${donationTitle}". The donor will no longer see it as pending.`;
    }

    setConfirm({ id, action, title, description });
  }

  function closeConfirm() {
    setConfirm(null);
  }

  const isDonor = user?.role === "donor";
  const isNpo = user?.role === "npo";

  const visibleRequests = requests.filter((r) => r.status !== "cancelled");
  const pendingRequests = visibleRequests.filter(
    (r) => r.status === "pending"
  );
  const pastRequests = visibleRequests.filter(
    (r) => r.status !== "pending"
  );

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">My pickup requests</h2>
            <p className="page-subtitle">
              Follow the status of pickup requests between donors and NPOs.
            </p>
          </div>
          {user && (
            <span className="badge">
              {user.name} · {user.role}
            </span>
          )}
        </div>

        {error && <p className="text-danger">{error}</p>}
        {visibleRequests.length === 0 && (
          <p className="text-muted">
            No active requests. Once a request is cancelled, it disappears from
            this list.
          </p>
        )}

        {pendingRequests.length > 0 && (
          <>
            <div className="section-title">Pending</div>
            <ul className="list">
              {pendingRequests.map((r) => {
                const donationTitle = r.donation?.title || "Donation item";

                const statusBanner = (
                  <div className="request-status-banner request-status-banner--pending">
                    <span>⏳</span>
                    <span>
                      This pickup request is <strong>pending</strong>. Waiting
                      for a decision.
                    </span>
                  </div>
                );

                return (
                  <li key={r._id} className="card">
                    <div>
                      <div className="card-title">{donationTitle}</div>
                      <div className="card-meta">
                        Pickup location: {r.donation?.pickupLocation || "-"}
                      </div>
                      <div className="card-tag-row">
                        <span className="tag">Status: {r.status}</span>
                        {r.scheduledDate && (
                          <span className="tag">
                            Scheduled:{" "}
                            {new Date(r.scheduledDate).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="form-help">
                        Message: {r.message || "No message provided."}
                      </p>
                      {statusBanner}
                    </div>

                    <div className="card-actions">
                      {isDonor && (
                        <>
                          <button
                            className="btn btn-primary"
                            disabled={busyId === r._id}
                            onClick={() =>
                              openConfirm(r._id, "accept", donationTitle)
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-outline"
                            disabled={busyId === r._id}
                            onClick={() =>
                              openConfirm(r._id, "reject", donationTitle)
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isNpo && (
                        <button
                          className="btn btn-danger"
                          disabled={busyId === r._id}
                          onClick={() =>
                            openConfirm(r._id, "cancel", donationTitle)
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {pastRequests.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 18 }}>
              Past requests
            </div>
            <ul className="list">
              {pastRequests.map((r) => {
                const donationTitle = r.donation?.title || "Donation item";

                let statusBanner = null;
                if (r.status === "accepted") {
                  statusBanner = (
                    <div className="request-status-banner request-status-banner--accepted">
                      <span>✅</span>
                      <span>
                        This pickup request has been{" "}
                        <strong>ACCEPTED by the donor</strong>.
                      </span>
                    </div>
                  );
                } else if (r.status === "rejected") {
                  statusBanner = (
                    <div className="request-status-banner request-status-banner--rejected">
                      <span>❌</span>
                      <span>
                        This pickup request was <strong>REJECTED</strong>.
                      </span>
                    </div>
                  );
                }

                return (
                  <li key={r._id} className="card">
                    <div>
                      <div className="card-title">{donationTitle}</div>
                      <div className="card-meta">
                        Pickup location: {r.donation?.pickupLocation || "-"}
                      </div>
                      <div className="card-tag-row">
                        <span className="tag">Status: {r.status}</span>
                        {r.scheduledDate && (
                          <span className="tag">
                            Scheduled:{" "}
                            {new Date(r.scheduledDate).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="form-help">
                        Message: {r.message || "No message provided."}
                      </p>
                      {statusBanner}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {confirm && (
        <div className="modal-backdrop" onClick={closeConfirm}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">{confirm.title}</h3>
              <button className="modal-close" onClick={closeConfirm}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.9rem", marginBottom: 16 }}>
                {confirm.description}
              </p>
              <p className="form-help" style={{ marginBottom: 12 }}>
                This action will update the status for both sides.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    await handleAction(confirm.id, confirm.action);
                    closeConfirm();
                  }}
                  disabled={busyId === confirm.id}
                >
                  Yes, continue
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={closeConfirm}
                >
                  No, go back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
