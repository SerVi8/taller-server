import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import cookieParser from "cookie-parser";
import { apiRouter } from "./modules/routes.js";
import { errorHandler, notFound } from "./core/middleware/error.middleware.js";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim().replace(/\/$/, ""),
);

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    message: "Lubrillantas API",
    status: "ok",
  });
});

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);
