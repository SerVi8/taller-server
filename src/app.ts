import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env";
import { healthRouter } from "./modules/health/health.routes";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "Lubrillantas API",
    status: "ok",
  });
});

app.use("/api/health", healthRouter);