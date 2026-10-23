import { UniqueConstraintError } from "sequelize";
import { ApiError } from "../../core/errors/ApiError.js";
import { clientMessages } from "./client.messages.js";

const clientErrorCodes = {
  notFound: "CLIENT_NOT_FOUND",
  vehicleNotFound: "CLIENT_VEHICLE_NOT_FOUND",
  activeVehicles: "CLIENT_HAS_ACTIVE_VEHICLES",
  duplicatePlate: "VEHICLE_PLATE_ALREADY_EXISTS",
  duplicateEmail: "CLIENT_EMAIL_ALREADY_EXISTS",
} as const;

export const clientErrors = {
  notFound: () =>
    new ApiError(404, clientErrorCodes.notFound, clientMessages.notFound),
  vehicleNotFound: () =>
    new ApiError(
      404,
      clientErrorCodes.vehicleNotFound,
      clientMessages.vehicleNotFound,
    ),
  activeVehicles: () =>
    new ApiError(
      409,
      clientErrorCodes.activeVehicles,
      clientMessages.activeVehicles,
    ),
  duplicatePlate: (plate?: string) =>
    new ApiError(
      409,
      clientErrorCodes.duplicatePlate,
      clientMessages.duplicatePlate(plate),
    ),
  duplicateEmail: () =>
    new ApiError(
      409,
      clientErrorCodes.duplicateEmail,
      clientMessages.duplicateEmail,
    ),
};

export function mapClientPersistenceError(error: unknown): unknown {
  if (!(error instanceof UniqueConstraintError)) return error;

  const conflict = error.errors[0];
  if (conflict?.path === "plate") {
    return clientErrors.duplicatePlate(String(conflict.value ?? "").trim());
  }
  if (conflict?.path === "email") return clientErrors.duplicateEmail();

  return error;
}
