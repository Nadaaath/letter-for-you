import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Letter For You API is running",
    status: "healthy",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "letter-for-you-backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;