import type { Request, Response } from "express";

import { loginSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";

const COOKIE_NAME = "access_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 8 * 60 * 60 * 1000,
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Datos de inicio de sesión inválidos",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { token, user } = await authService.login(
      result.data.username,
      result.data.password,
    );


    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(200).json({
      user,
    });
  } catch {
    res.status(401).json({
      message: "Correo o contraseña incorrectos",
    });
  }
};

export const me = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      message: "No autenticado",
    });
    return;
  }

  res.status(200).json({
    user: req.user,
  });
};

export const logout = (
  _req: Request,
  res: Response,
): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    message: "Sesión cerrada correctamente",
  });
};