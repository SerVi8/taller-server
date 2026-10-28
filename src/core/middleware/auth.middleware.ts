import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { getUserById } from "../../modules/auth/auth.service.js";
import type { AuthTokenPayload } from "../../modules/auth/auth.types.js";
import { ApiError } from "../errors/ApiError.js";
import { errorCodes } from "../errors/error-codes.js";
import { coreErrorMessages } from "../errors/error-messages.js";

const COOKIE_NAME = "access_token";

const getTokenFromRequest = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) return bearerToken;
  }

  return req.cookies?.[COOKIE_NAME];
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = getTokenFromRequest(req);
  if (!token) {
    next(
      new ApiError(
        401,
        errorCodes.unauthenticated,
        coreErrorMessages.unauthenticated,
      ),
    );
    return;
  }

  let decoded: AuthTokenPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
  } catch {
    next(
      new ApiError(
        401,
        errorCodes.invalidSession,
        coreErrorMessages.invalidSession,
      ),
    );
    return;
  }

  const user = await getUserById(Number(decoded.sub));
  if (!user) {
    next(
      new ApiError(
        401,
        errorCodes.unauthenticated,
        coreErrorMessages.unauthenticated,
      ),
    );
    return;
  }

  req.user = user;
  next();
};
