// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DonationsList from "./pages/DonationsList.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import CreateDonation from "./pages/CreateDonation.jsx"; // <- add this
import MyDonations from "./pages/MyDonations.jsx";
import MyRequests from "./pages/MyRequests.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/donations" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <DonationsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donations/new"
        element={
          <ProtectedRoute>
            <CreateDonation />
          </ProtectedRoute>
        }
      />
<Route
  path="/my-donations"
  element={
    <ProtectedRoute>
      <MyDonations />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-requests"
  element={
    <ProtectedRoute>
      <MyRequests />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
}

