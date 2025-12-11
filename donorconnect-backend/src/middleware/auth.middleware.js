// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Check that the request has a valid JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Format expected: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach user info to the request
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Optional: check user role(s)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}
