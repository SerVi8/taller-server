export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: Record<string, string[]> | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
