import { UniqueConstraintError, ValidationError } from "sequelize";
import { ZodError } from "zod";
import { ApiError } from "./ApiError.js";
import { errorCodes } from "./error-codes.js";
import { coreErrorMessages } from "./error-messages.js";

const toDetails = (
  errors: Array<{ path: PropertyKey[]; message: string }>,
): Record<string, string[]> => {
  const details: Record<string, string[]> = {};

  for (const error of errors) {
    const key = error.path.map(String).join(".") || "form";
    details[key] ??= [];
    details[key].push(error.message);
  }

  return details;
};

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(
      400,
      errorCodes.validationFailed,
      coreErrorMessages.invalidRequest,
      toDetails(error.issues),
    );
  }

  if (error instanceof UniqueConstraintError) {
    return new ApiError(
      409,
      errorCodes.resourceConflict,
      coreErrorMessages.resourceConflict,
    );
  }

  if (error instanceof ValidationError) {
    return new ApiError(
      400,
      errorCodes.validationFailed,
      coreErrorMessages.invalidRequest,
      toDetails(
        error.errors.map((item) => ({
          path: [item.path ?? "form"],
          message: item.message,
        })),
      ),
    );
  }

  return new ApiError(500, errorCodes.internal, coreErrorMessages.internal);
}
