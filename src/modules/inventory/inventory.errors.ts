import { UniqueConstraintError } from "sequelize";
import { ApiError } from "../../core/errors/ApiError.js";
import { inventoryMessages } from "./inventory.messages.js";
import { Product } from "../../database/models/product.model.js";

const inventoryErrorCodes = {
  notFound: "PRODUCT_NOT_FOUND",
  duplicateSku: "CODE_ALREADY_EXISTS",
  noStock: "INSUFFICIENT_STOCK",
} as const;

export const inventoryErrors = {
  notFound: () =>
    new ApiError(
      404,
      inventoryErrorCodes.notFound,
      inventoryMessages.product.notFound,
    ),

  duplicateSku: (plate?: string) =>
    new ApiError(
      409,
      inventoryErrorCodes.duplicateSku,
      inventoryMessages.product.duplicateSku(plate),
    ),
  noStock: (product: Product) =>
    new ApiError(
      409,
      inventoryErrorCodes.noStock,
      inventoryMessages.product.noStock(product),
    ),
};

export function mapInventoryPersistenceError(error: unknown): unknown {
  if (!(error instanceof UniqueConstraintError)) return error;

  const conflict = error.errors[0];
  if (conflict?.path === "sku") {
    return inventoryErrors.duplicateSku(String(conflict.value ?? "").trim());
  }

  return error;
}
