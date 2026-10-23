import type { ApiError } from "./ApiError.js";

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export function toErrorResponse(error: ApiError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}
