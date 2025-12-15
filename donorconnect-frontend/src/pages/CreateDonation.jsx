import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

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

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.quantity < 1) {
      const msg = "Quantity must be at least 1.";
      setError(msg);
      notify(msg, "error");
      return;
    }

    if (!form.availableDate) {
      const msg = "Available date is required.";
      setError(msg);
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

      await api.post("/donations", fd, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      notify("Donation created successfully.", "success");
      navigate("/donations");
    } catch (err) {
      let msg = "Failed to create donation";

      if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.fields) {
          msg = Object.values(data.fields).join(" - ");
        } else if (data.error) {
          msg = data.error;
        }
      }

      setError(msg);
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Create a new donation</h2>
          <p className="page-subtitle">
            Add an item you want to give away. NGOs will be able to request a
            pickup with a proposed date.
          </p>
        </div>
        {user && <span className="badge">Donor: {user.name}</span>}
      </div>

      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Winter jackets for adults"
          />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Condition</label>
          <input
            type="text"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            placeholder="Good, Like New..."
          />
        </div>

        <div className="form-field">
          <label>Pickup Location</label>
          <input
            type="text"
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
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
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="form-help">
            Optional, but photos help NGOs assess the item quickly.
          </p>
        </div>

        <div className="form-field">
          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Open">Open</option>
            <option value="Reserved">Reserved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create donation"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/donations")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
