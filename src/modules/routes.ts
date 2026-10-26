import { Router } from "express";
import { healthRouter } from "./health/health.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { clientRouter } from "./clients/client.routes.js";
import { productRouter, stockRouter } from "./inventory/inventori.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/clients", clientRouter);
apiRouter.use("/product", productRouter);
apiRouter.use("/stock", stockRouter);
