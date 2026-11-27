import crypto from "node:crypto";

let apps = [];
const buckets = new Map();

function rateLimit(req, res) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + 15 * 60 * 1000 };
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > 5) {
    res.status(429).json({ error: "Too many app submissions. Try again later." });
    return false;
  }
  return true;
}

function adminApproved(req) {
  const expected = process.env.APP_ADMIN_TOKEN || "";
  const supplied = req.get("x-app-admin-token") || "";
  if (expected.length < 32 || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createApp(req, res) {
  if (!rateLimit(req, res)) return;
  if (!adminApproved(req)) {
    return res.status(process.env.APP_ADMIN_TOKEN ? 401 : 503).json({
      error: "App creation requires APP_ADMIN_TOKEN (32+ characters) in Render Environment."
    });
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
  const owner = typeof req.body?.owner === "string" ? req.body.owner.trim() : "";
  const price = Number(req.body?.price);

  if (!name || name.length > 80 || !description || description.length > 2000 ||
      !owner || owner.length > 120 || !Number.isFinite(price) || price < 0 || price > 100000) {
    return res.status(400).json({ error: "Provide a valid name, description, owner, and non-negative price." });
  }
  if (apps.length >= 1000) return res.status(507).json({ error: "Prototype app limit reached." });

  const item = { id: crypto.randomUUID(), name, description, price, owner, createdAt: new Date().toISOString() };
  apps.push(item);
  return res.status(201).json(item);
}

export function getApps(_req, res) {
  res.json(apps);
}
