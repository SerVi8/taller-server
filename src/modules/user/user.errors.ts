import { UniqueConstraintError } from "sequelize";
import { ApiError } from "../../core/errors/ApiError.js";
import { userMessages } from "./user.messages.js";

const userErrorCodes = {
  notFound: "USER_NOT_FOUND",
  duplicateUsername: "USERNAME_ALREADY_EXISTS",
  duplicateEmail: "USER_EMAIL_ALREADY_EXISTS",
  cannotRemoveOwnAdmin: "CANNOT_REMOVE_OWN_ADMIN",
  lastActiveAdmin: "LAST_ACTIVE_ADMIN_REQUIRED",
} as const;

export const userErrors = {
  notFound: () =>
    new ApiError(404, userErrorCodes.notFound, userMessages.notFound),

  duplicateUsername: () =>
    new ApiError(
      409,
      userErrorCodes.duplicateUsername,
      userMessages.duplicateUsername,
    ),

  duplicateEmail: () =>
    new ApiError(
      409,
      userErrorCodes.duplicateEmail,
      userMessages.duplicateEmail,
    ),

  cannotRemoveOwnAdmin: () =>
    new ApiError(
      409,
      userErrorCodes.cannotRemoveOwnAdmin,
      userMessages.cannotRemoveOwnAdmin,
    ),

  lastActiveAdmin: () =>
    new ApiError(
      409,
      userErrorCodes.lastActiveAdmin,
      userMessages.lastActiveAdmin,
    ),
};

export function mapUserPersistenceError(error: unknown): unknown {
  if (!(error instanceof UniqueConstraintError)) return error;

  const conflict = error.errors[0];
  if (conflict?.path === "name") return userErrors.duplicateUsername();
  if (conflict?.path === "email") return userErrors.duplicateEmail();

  return error;
}
