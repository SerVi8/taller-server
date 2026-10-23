import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../errors/ApiError.js";
import { errorCodes } from "../errors/error-codes.js";
import { coreErrorMessages } from "../errors/error-messages.js";
import { normalizeError } from "../errors/normalize-error.js";
import { toErrorResponse } from "../errors/error-response.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(
    new ApiError(
      404,
      errorCodes.routeNotFound,
      coreErrorMessages.routeNotFound,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = normalizeError(err);

  if (error.statusCode >= 500) {
    console.error(err);
  }

  res.status(error.statusCode).json(toErrorResponse(error));
};
