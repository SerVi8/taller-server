import type { Request, Response } from "express";
import { sequelize } from "../../config/database.js";

export const healthCheck = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    await sequelize.authenticate();

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
};
