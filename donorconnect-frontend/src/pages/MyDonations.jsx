import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function MyDonations() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  // create/edit modal state
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState("create"); // "create" or "edit"
  const [currentDonation, setCurrentDonation] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: 1,
    condition: "Good",
    pickupLocation: "",
    availableDate: "",
    status: "Open"
  });

  // delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        api.get("/donations/mine"),
        api.get("/requests")
      ]);
      setDonations(donationsRes.data || []);
      setRequests(requestsRes.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load your donations");
      notify("Could not load donations/requests.", "error");
    }
  }

  useEffect(() => {
    load();
  }, [notify]);

  // ----- CREATE / EDIT MODAL -----

  function resetForm() {
    setForm({
      title: "",
      description: "",
      category: "",
      quantity: 1,
      condition: "Good",
      pickupLocation: "",
      availableDate: "",
      status: "Open"
    });
    setImageFile(null);
    setFormError("");
    setSubmitting(false);
    setCurrentDonation(null);
    setMode("create");
  }

  function openCreateModal() {
    resetForm();
    setMode("create");
    setCreating(true);
  }

  function openEditModal(donation) {
    setMode("edit");
    setCurrentDonation(donation);
    setForm({
      title: donation.title || "",
      description: donation.description || "",
      category: donation.category || "",
      quantity: donation.quantity || 1,
      condition: donation.condition || "Good",
      pickupLocation: donation.pickupLocation || "",
      availableDate: donation.availableDate
        ? donation.availableDate.slice(0, 10)
        : "",
      status: donation.status || "Open"
    });
    setImageFile(null);
    setFormError("");
    setSubmitting(false);
    setCreating(true);
  }

  function closeCreateModal() {
    setCreating(false);
    setFormError("");
    setSubmitting(false);
  }

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setImageFile(file || null);
  }

  async function handleSubmitDonation(e) {
    e.preventDefault();
    setFormError("");

    if (form.quantity < 1) {
      const msg = "Quantity must be at least 1.";
      setFormError(msg);
      notify(msg, "error");
      return;
    }
    if (!form.availableDate) {
      const msg = "Available date is required.";
      setFormError(msg);
      notify(msg, "error");
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });
      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (mode === "create") {
        // POST /donations
        await api.post("/donations", fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        notify("Donation created successfully.", "success");
      } else if (mode === "edit" && currentDonation) {
        // PUT /donations/:id
        await api.put(`/donations/${currentDonation._id}`, fd, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        notify("Donation updated successfully.", "success");
      }

      await load();
      closeCreateModal();
    } catch (err) {
      let msg = mode === "create"
        ? "Failed to create donation"
        : "Failed to update donation";

      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.fields) {
          msg = Object.values(data.fields).join(" - ");
        } else if (data.error) {
          msg = data.error;
        }
      }

      setFormError(msg);
      notify(msg, "error");
      setSubmitting(false);
    }
  }

  // ----- DELETE MODAL -----

  function openDeleteModal(donation) {
    setDeleteTarget(donation);
    setDeleting(false);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleting(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/donations/${deleteTarget._id}`);
      notify("Donation deleted.", "info");
      await load();
      closeDeleteModal();
    } catch (err) {
      notify("Failed to delete donation.", "error");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <h2 className="page-title">My donations</h2>
            <p className="page-subtitle">
              See all items you have published, how many pickup requests they
              received, and update or delete them from here.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user && (
              <span className="badge">
                {user.name} · {user.role}
              </span>
            )}
            {user?.role === "donor" && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                + New donation
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-danger">{error}</p>}
        {donations.length === 0 && (
          <p className="text-muted">
            You have not published any donations yet. Use{" "}
            <strong>“New donation”</strong> to add your first item.
          </p>
        )}

        <ul className="list">
          {donations.map((d) => {
            const related = requests.filter(
              (r) => r.donation && r.donation._id === d._id
            );
            const pending = related.filter((r) => r.status === "pending").length;
            const accepted = related.filter((r) => r.status === "accepted").length;
            const rejected = related.filter((r) => r.status === "rejected").length;

            return (
              <li key={d._id} className="card">
                <div className="card-title">{d.title}</div>
                <div className="card-meta">
                  {d.category} · {d.quantity} item(s)
                </div>
                <div className="card-tag-row">
                  <span className="tag">Status: {d.status}</span>
                  <span className="tag">{d.pickupLocation}</span>
                  {d.availableDate && (
                    <span className="tag">
                      From {new Date(d.availableDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="form-help">
                  Requests: {related.length} total · {pending} pending ·{" "}
                  {accepted} accepted · {rejected} rejected
                </p>

                <div className="card-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => openEditModal(d)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => openDeleteModal(d)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CREATE / EDIT MODAL */}
      {creating && (
        <div className="modal-backdrop" onClick={closeCreateModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {mode === "create" ? "Create a new donation" : "Edit donation"}
              </h3>
              <button className="modal-close" onClick={closeCreateModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {formError && (
                <p className="text-danger" style={{ marginBottom: 8 }}>
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmitDonation} className="form-grid">
                <div className="form-field">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFieldChange}
                    required
                    placeholder="Winter jackets for adults"
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    rows={3}
                    placeholder="Short description, sizes, brand, any important details..."
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleFieldChange}
                    placeholder="Clothes, Furniture, Food..."
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    value={form.quantity}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Condition</label>
                  <input
                    type="text"
                    name="condition"
                    value={form.condition}
                    onChange={handleFieldChange}
                    placeholder="Good, Like New..."
                  />
                </div>

                <div className="form-field">
                  <label>Pickup location</label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleFieldChange}
                    required
                    placeholder="City, neighborhood..."
                  />
                </div>

                <div className="form-field">
                  <label>Available from</label>
                  <input
                    type="date"
                    name="availableDate"
                    value={form.availableDate}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="form-help">
                    Optional, but photos help NGOs assess the item quickly.
                  </p>
                  {mode === "edit" && currentDonation?.imageUrl && (
                    <p className="form-help">
                      Current image is still used if you don&apos;t upload a new
                      one.
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFieldChange}
                  >
                    <option value="Open">Open</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting
                      ? mode === "create"
                        ? "Creating..."
                        : "Saving..."
                      : mode === "create"
                        ? "Create donation"
                        : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeCreateModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Delete this donation?</h3>
              <button className="modal-close" onClick={closeDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                You are about to delete the donation{" "}
                <strong>{deleteTarget.title}</strong>. This action cannot be
                undone.
              </p>
              <p className="form-help" style={{ marginBottom: 12 }}>
                If there are existing pickup requests, they will no longer be
                visible for this item.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
