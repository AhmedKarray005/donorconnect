import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function DonationsList() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [donations, setDonations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalDonation, setModalDonation] = useState(null);
  const [requestForm, setRequestForm] = useState({
    message: "",
    scheduledDate: ""
  });
  const [requestError, setRequestError] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const isDonor = user?.role === "donor";
  const isNpo = user?.role === "npo";

  async function loadDonations() {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/donations");
      const items = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDonations(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load donations");
      notify("Could not load donations.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    donations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [donations]);

  const filteredDonations = useMemo(() => {
    let list = [...donations];

    if (statusFilter !== "all") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((d) => d.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.pickupLocation?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.availableDate || 0) -
          new Date(a.createdAt || a.availableDate || 0)
      );
    } else if (sortBy === "available") {
      list.sort(
        (a, b) =>
          new Date(a.availableDate || 0) - new Date(b.availableDate || 0)
      );
    } else if (sortBy === "quantity") {
      list.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    }

    return list;
  }, [donations, statusFilter, categoryFilter, search, sortBy]);

  function openRequestModal(donation) {
    setModalDonation(donation);
    setRequestForm({
      message: "",
      scheduledDate: donation.availableDate
        ? donation.availableDate.slice(0, 10)
        : ""
    });
    setRequestError("");
  }

  function closeRequestModal() {
    setModalDonation(null);
    setRequestError("");
    setRequestForm({ message: "", scheduledDate: "" });
  }

  function handleRequestChange(e) {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitRequest(e) {
    e.preventDefault();
    setRequestError("");

    if (!requestForm.message.trim()) {
      const msg = "Message is required.";
      setRequestError(msg);
      notify(msg, "error");
      return;
    }
    if (!requestForm.scheduledDate.trim()) {
      const msg = "Pickup date is required.";
      setRequestError(msg);
      notify(msg, "error");
      return;
    }

    try {
      setRequestSubmitting(true);
      await api.post("/requests", {
        donationId: modalDonation._id,
        message: requestForm.message.trim(),
        scheduledDate: requestForm.scheduledDate.trim()
      });
      await loadDonations();
      notify("Pickup request sent to the donor.", "success");
      closeRequestModal();
    } catch (err) {
      console.error(err);
      let msg = "Failed to create request.";

      const data = err.response?.data;
      if (data?.error) {
        msg = data.error;
      } else if (data?.fields) {
        msg = Object.values(data.fields).join(" - ");
      }

      setRequestError(msg);
      notify(msg, "error");
    } finally {
      setRequestSubmitting(false);
    }
  }

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Available donations</h2>
            <p className="page-subtitle">
              Browse items shared by donors and, as an NGO/NPO, request pickups
              with a proposed date.
            </p>
          </div>
          {user && (
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              Logged in as <strong>{user.name}</strong> ({user.role})
            </div>
          )}
        </div>

        <div className="filters-bar">
          <span className="filters-label">Filter & search:</span>
          <div className="filters-row">
            <div className="filters-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="Open">Open</option>
                <option value="Reserved">Reserved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="filters-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="filters-group">
              <input
                type="text"
                placeholder="Search title, description, location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filters-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: newest</option>
                <option value="available">Sort: available date</option>
                <option value="quantity">Sort: quantity</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="text-muted">Loading donations...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && filteredDonations.length === 0 && (
          <p className="centered text-muted">
            No donations match your filters. Try changing status, category or
            search text.
          </p>
        )}

        <ul className="list">
          {filteredDonations.map((d) => {
            const statusClass =
              d.status === "Open"
                ? "donation-card--open"
                : d.status === "Reserved"
                ? "donation-card--reserved"
                : d.status === "Completed"
                ? "donation-card--completed"
                : "";

            return (
              <li
                key={d._id}
                className={`card donation-card ${statusClass}`}
              >
                <div className="donation-main">
                  <div className="card-title">{d.title}</div>
                  <div className="card-meta">
                    {d.category} · {d.quantity} item(s) · condition:{" "}
                    {d.condition || "N/A"}
                  </div>
                  <div className="card-tag-row">
                    <span className="tag">{d.pickupLocation}</span>
                    <span className="tag">Status: {d.status}</span>
                    {d.availableDate && (
                      <span className="tag">
                        From {new Date(d.availableDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {d.imageUrl && (
                    <div className="card-image">
                      <img
                        src={`http://localhost:3000${d.imageUrl}`}
                        alt={d.title}
                      />
                    </div>
                  )}
                </div>

                <div className="donation-side">
                  {isNpo && d.status === "Open" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => openRequestModal(d)}
                    >
                      Request pickup
                    </button>
                  )}

                  {isDonor && d.status === "Open" && (
                    <span className="form-help">
                      NGOs can see this donation and send pickup requests.
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {modalDonation && (
        <div className="modal-backdrop" onClick={closeRequestModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Request pickup</h3>
              <button className="modal-close" onClick={closeRequestModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="form-help">
                Donation: <strong>{modalDonation.title}</strong> ·{" "}
                {modalDonation.pickupLocation}
              </p>

              {requestError && (
                <p className="text-danger" style={{ marginBottom: 8 }}>
                  {requestError}
                </p>
              )}

              <form onSubmit={submitRequest} className="form-grid">
                <div className="form-field">
                  <label>Message to donor</label>
                  <textarea
                    name="message"
                    rows={3}
                    value={requestForm.message}
                    onChange={handleRequestChange}
                    placeholder="Explain your organisation and how you'll use this donation."
                  />
                </div>

                <div className="form-field">
                  <label>Pickup date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={requestForm.scheduledDate}
                    onChange={handleRequestChange}
                  />
                  <p className="form-help">
                    Must be on or after the available date chosen by the donor.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={requestSubmitting}
                  >
                    {requestSubmitting ? "Sending..." : "Send request"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeRequestModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
