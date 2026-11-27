import express from "express";
import cors from "cors";
import { createApp, getApps } from "./routes/apps.js";

const app = express();
const port = Number(process.env.PORT || 3000);
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => res.json({ status: "AI SaaS Marketplace Running" }));
app.get("/health", (_req, res) => res.json({ ok: true, app: "AI Business OS Platform" }));
app.get("/api/apps", getApps);
app.post("/api/apps", createApp);
app.listen(port, "0.0.0.0", () => console.log("AI Business OS listening on " + port));
