import { Router } from "express";
import { healthRouter } from "./health/health.routes";
import { authRouter } from "./auth/auth.routes";

export const apiRouter = Router(); 

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);