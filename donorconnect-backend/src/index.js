// src/server.js
import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoose } from "./db/mongoose.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectMongoose(); // connect to MongoDB through Mongoose

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
