import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["donor", "npo", "admin"],
      default: "donor"
    },

    // common
    phone: { type: String },

    // donor-only
    address: { type: String },

    // NPO-only
    organizationName: { type: String },
    mission: { type: String },
    city: { type: String },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
