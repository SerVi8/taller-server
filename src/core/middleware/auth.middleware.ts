import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { getUserById } from "../../modules/auth/auth.service.js";
import type { AuthTokenPayload } from "../../modules/auth/auth.types.js";

const COOKIE_NAME = "access_token";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        message: "No autenticado",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET,
    ) as AuthTokenPayload;

    const user = await getUserById(Number(decoded.sub));

    if (!user) {
      res.status(401).json({
        message: "Usuario no válido",
      });
      return;
    }

    req.user = user;

    next();
  } catch {
    res.status(401).json({
      message: "Sesión inválida o expirada",
    });
  }
};