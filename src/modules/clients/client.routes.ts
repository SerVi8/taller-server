import { Router } from "express";
import * as ctrl from "./client.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";

export const clientRouter = Router();

clientRouter.use(requireAuth);

clientRouter.get("/", ctrl.list);
clientRouter.post("/", ctrl.create);
clientRouter.get("/:id", ctrl.getById);
clientRouter.patch("/:id", ctrl.update);
clientRouter.delete("/:id", requireRole("admin"), ctrl.remove);
