import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { getGardenById } from "./repositories/garden.repository.js";
import vaultRoutes from "./routes/vault.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({ origin: env.frontendUrl, credentials: false }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
// Process-local limits are only a supplement. Use API Gateway throttling in AWS.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/", (_req, res) => res.json({ message: "Letter For You API is running" }));
app.get("/health", (_req, res) => res.json({
  status: "ok", service: "letter-for-you-backend",
}));
app.get("/health/db", async (_req, res, next) => {
  try {
    await getGardenById("__health_check_nonexistent__");
    res.json({ status: "ok", database: "connected" });
  } catch (error) { next(error); }
});
app.use("/api/vaults", vaultRoutes);
app.use(errorMiddleware);
export default app;
