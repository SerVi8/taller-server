import { Router } from "express";
import { requireAuth } from "../../core/middleware/auth.middleware.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import * as ctrl from "./user.controller.js";

export const userRouter = Router();

userRouter.use(requireAuth, requireRole("admin"));

userRouter.get("/", ctrl.list);
userRouter.post("/", ctrl.create);
userRouter.get("/:id", ctrl.getById);
userRouter.patch("/:id", ctrl.update);
userRouter.patch("/:id/password", ctrl.updatePassword);
userRouter.delete("/:id", ctrl.remove);
