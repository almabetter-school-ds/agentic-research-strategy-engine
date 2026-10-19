import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { connectMongo } from "./utils/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 8080;

await connectMongo();

createApp().listen(port, () => {
  console.log(`McKinsey AI Market Research API listening on ${port}`);
});
