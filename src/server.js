import dotenv from "dotenv";
import app from "./app.js";
import { connectToDb } from "./db/mongo.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDb(); // <---- important
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
