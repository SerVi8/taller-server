import type { Request, Response } from "express";
import { ApiError } from "../../core/errors/ApiError.js";
import { errorCodes } from "../../core/errors/error-codes.js";
import { coreErrorMessages } from "../../core/errors/error-messages.js";
import { loginSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";

const cookieName = "access_token";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 8 * 60 * 60 * 1000,
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = loginSchema.parse(req.body);
  const { token, user } = await authService.login(username, password);

  res.cookie(cookieName, token, cookieOptions);
  res.status(200).json({ user });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(
      401,
      errorCodes.unauthenticated,
      coreErrorMessages.unauthenticated,
    );
  }

  res.status(200).json({ user: req.user });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(204).send();
};
