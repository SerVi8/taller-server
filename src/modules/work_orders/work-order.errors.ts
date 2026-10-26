import { UniqueConstraintError } from "sequelize";
import { ApiError } from "../../core/errors/ApiError.js";
import { workOrderMessages } from "./work-order.messages.js";

const workOrderErrorCodes = {
  notFound: "WORK_ORDER_NOT_FOUND",
  serviceNotFound: "WORK_ORDER_SERVICE_NOT_FOUND",
  itemNotFound: "WORK_ORDER_ITEM_NOT_FOUND",
  itemAlreadyExists: "WORK_ORDER_ITEM_ALREADY_EXISTS",
  vehicleNotFound: "VEHICLE_NOT_AVAILABLE",
  openOrderConflict: "VEHICLE_HAS_OPEN_WORK_ORDER",
  invalidMileageIn: "INVALID_MILEAGE_IN",
  invalidMileageOut: "INVALID_MILEAGE_OUT",
  invalidDiscount: "INVALID_WORK_ORDER_DISCOUNT",
  orderNotEditable: "WORK_ORDER_NOT_EDITABLE",
  invalidStatusTransition: "INVALID_WORK_ORDER_STATUS_TRANSITION",
  duplicateCode: "WORK_ORDER_CODE_ALREADY_EXISTS",
} as const;

export const workOrderErrors = {
  notFound: () =>
    new ApiError(
      404,
      workOrderErrorCodes.notFound,
      workOrderMessages.notFound,
    ),
  serviceNotFound: () =>
    new ApiError(
      404,
      workOrderErrorCodes.serviceNotFound,
      workOrderMessages.serviceNotFound,
    ),
  itemNotFound: () =>
    new ApiError(
      404,
      workOrderErrorCodes.itemNotFound,
      workOrderMessages.itemNotFound,
    ),
  itemAlreadyExists: () =>
    new ApiError(
      409,
      workOrderErrorCodes.itemAlreadyExists,
      workOrderMessages.itemAlreadyExists,
    ),
  vehicleNotFound: () =>
    new ApiError(
      404,
      workOrderErrorCodes.vehicleNotFound,
      workOrderMessages.vehicleNotFound,
    ),
  openOrderConflict: (code: string) =>
    new ApiError(
      409,
      workOrderErrorCodes.openOrderConflict,
      workOrderMessages.openOrderConflict(code),
    ),
  invalidMileageIn: (lastMileage: number) =>
    new ApiError(
      400,
      workOrderErrorCodes.invalidMileageIn,
      workOrderMessages.invalidMileageIn(lastMileage),
    ),
  invalidMileageOut: (mileageIn: number) =>
    new ApiError(
      400,
      workOrderErrorCodes.invalidMileageOut,
      workOrderMessages.invalidMileageOut(mileageIn),
    ),
  invalidDiscount: () =>
    new ApiError(
      400,
      workOrderErrorCodes.invalidDiscount,
      workOrderMessages.invalidDiscount,
    ),
  orderNotEditable: () =>
    new ApiError(
      409,
      workOrderErrorCodes.orderNotEditable,
      workOrderMessages.orderNotEditable,
    ),
  cannotStartOrder: () =>
    new ApiError(
      409,
      workOrderErrorCodes.invalidStatusTransition,
      workOrderMessages.cannotStartOrder,
    ),
  cannotCompleteOrder: () =>
    new ApiError(
      409,
      workOrderErrorCodes.invalidStatusTransition,
      workOrderMessages.cannotCompleteOrder,
    ),
  cannotCancelOrder: () =>
    new ApiError(
      409,
      workOrderErrorCodes.invalidStatusTransition,
      workOrderMessages.cannotCancelOrder,
    ),
  duplicateCode: () =>
    new ApiError(
      409,
      workOrderErrorCodes.duplicateCode,
      workOrderMessages.duplicateCode,
    ),
};

export function mapWorkOrderPersistenceError(error: unknown): unknown {
  if (!(error instanceof UniqueConstraintError)) return error;

  const conflict = error.errors[0];
  if (conflict?.path === "code") {
    return workOrderErrors.duplicateCode();
  }

  return error;
}
