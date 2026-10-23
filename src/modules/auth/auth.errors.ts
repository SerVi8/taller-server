import { ApiError } from "../../core/errors/ApiError.js";
import { authMessages } from "./auth.messages.js";

export const authErrors = {
  invalidCredentials: () =>
    new ApiError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      authMessages.invalidCredentials,
    ),
};
