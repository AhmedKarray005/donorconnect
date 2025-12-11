// src/models/donation.model.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    condition: {
      type: String,
      default: "Good"
    },
    pickupLocation: {
      type: String,
      required: true
    },
    availableDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Open", "Reserved", "Completed", "Cancelled"],
      default: "Open"
    },
    imageUrl: {
  type: String
},
    donorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}

  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
