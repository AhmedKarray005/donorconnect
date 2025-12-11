// src/db/mongoose.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export async function connectMongoose() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("Error connecting to MongoDB via Mongoose:", err);
    process.exit(1);
  }
}
