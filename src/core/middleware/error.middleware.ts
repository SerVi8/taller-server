import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { UniqueConstraintError, ValidationError } from "sequelize";

import { env } from "../../config/env.js";
import { ApiError } from "../errors/ApiError.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = "Error interno del servidor";

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    message = err.issues.map((i) => i.message).join(", ");
  } else if (err instanceof UniqueConstraintError) {
    status = 409;
    message = "Ya existe un registro con esos datos";
  } else if (err instanceof ValidationError) {
    status = 400;
    message = err.errors.map((e) => e.message).join(", ");
  } else {
    console.error(err); // errores inesperados solo al log, no al cliente
  }

  res.status(status).json({
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};