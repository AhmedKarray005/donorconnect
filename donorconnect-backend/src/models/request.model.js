// src/models/request.model.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending"
    },
    message: {
      type: String,
      default: ""
    },
    scheduledDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
