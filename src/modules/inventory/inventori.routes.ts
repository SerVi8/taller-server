import { Router } from "express";
import * as ctrl from "./inventory.controller.js";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get("/", ctrl.list);
productRouter.post("/", ctrl.create);
productRouter.get("/:id", ctrl.getById);
productRouter.patch("/:id", ctrl.update);
productRouter.delete("/:id", requireRole("admin"), ctrl.remove);

export const stockRouter = Router();
stockRouter.use(requireAuth);

stockRouter.post("/entries", requireRole("admin"), ctrl.createEntry);
stockRouter.get("/movements", ctrl.stockMovements);
