import { Router } from "express";
import { healthRouter } from "./health/health.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { clientRouter } from "./clients/client.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/clients", clientRouter);
