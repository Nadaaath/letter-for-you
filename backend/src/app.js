import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import vaultRoutes from "./routes/vault.routes.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({ origin: env.frontendUrl, credentials: false }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/", (_req, res) => res.json({ message: "Letter For You API is running" }));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "letter-for-you-backend" }));
app.get("/health/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) { next(error); }
});

// No /api/auth route in the account-free application.
app.use("/api/vaults", vaultRoutes);
app.use(errorMiddleware);
export default app;
