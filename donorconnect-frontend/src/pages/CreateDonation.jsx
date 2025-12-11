// src/pages/CreateDonation.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

    navigate("/donations");
  } catch (err) {
    if (err.response && err.response.data) {
      const data = err.response.data;

      if (data.fields) {
        setError(Object.values(data.fields).join(" - "));
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Failed to create donation");
      }
    } else {
      setError("Failed to create donation");
    }
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2>Create Donation</h2>

      {user && (
        <p>
          Creating as <strong>{user.name}</strong> ({user.role})
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Title</label>
          <br />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Category</label>
          <br />
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Clothes, Furniture, Food..."
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Quantity</label>
          <br />
          <input
            type="number"
            name="quantity"
            min={1}
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Condition</label>
          <br />
          <input
            type="text"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            placeholder="Good, Like New..."
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Pickup Location</label>
          <br />
          <input
            type="text"
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Available Date</label>
          <br />
          <input
            type="date"
            name="availableDate"
            value={form.availableDate}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
  <label>Image</label>
  <br />
  <input type="file" accept="image/*" onChange={handleFileChange} />
</div>


        <div style={{ marginBottom: 10 }}>
          <label>Status</label>
          <br />
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

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Donation"}
        </button>
      </form>
    </div>
  );
}
