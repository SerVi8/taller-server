import type { RequestHandler } from "express";
import type { UserRole } from "../../database/models/user.model.js";
import { ApiError } from "../errors/ApiError.js";
import { errorCodes } from "../errors/error-codes.js";
import { coreErrorMessages } from "../errors/error-messages.js";

export const requireRole = (...roles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user) {
      next(
        new ApiError(
          401,
          errorCodes.unauthenticated,
          coreErrorMessages.unauthenticated,
        ),
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new ApiError(
          403,
          errorCodes.forbidden,
          coreErrorMessages.forbidden,
        ),
      );
      return;
    }

    next();
  };
