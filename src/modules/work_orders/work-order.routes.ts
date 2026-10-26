import { Router } from "express";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import * as ctrl from "./work-order.controller.js";

export const workOrderRouter = Router();

workOrderRouter.use(requireAuth);

workOrderRouter.get("/", ctrl.list);
workOrderRouter.post("/", ctrl.create);
workOrderRouter.get("/:id", ctrl.getById);
workOrderRouter.patch("/:id", ctrl.update);

// Estado de la orden
workOrderRouter.post("/:id/start", ctrl.start);
workOrderRouter.post("/:id/complete", ctrl.complete);
workOrderRouter.post("/:id/cancel", ctrl.cancel);

// Servicios de la orden
workOrderRouter.post("/:id/services", ctrl.addService);
workOrderRouter.patch("/:id/services/:serviceId", ctrl.updateService);
workOrderRouter.delete("/:id/services/:serviceId", ctrl.removeService);

// Ítems / Productos de la orden
workOrderRouter.post("/:id/items", ctrl.addItem);
workOrderRouter.patch("/:id/items/:itemId", ctrl.updateItem);
workOrderRouter.delete("/:id/items/:itemId", ctrl.removeItem);
