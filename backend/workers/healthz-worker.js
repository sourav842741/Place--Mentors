import express from "express";

const app = express();
const port = process.env.WORKER_PORT ? Number(process.env.WORKER_PORT) : 5050;

app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[WORKER HEALTH] listening on ${port}`);
});