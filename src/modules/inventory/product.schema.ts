import z from "zod";
import {
  optionalText,
  paginationSchema,
} from "../../shared/schemas/common.schema.js";
import { inventoryMessages } from "./inventory.messages.js";
import { MOVEMENT_REASONS } from "../../database/models/stock-movement.model.js";

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, inventoryMessages.product.validation.skuRequired)
    .max(50),
  name: z
    .string()
    .trim()
    .min(2, inventoryMessages.product.validation.nameRequired)
    .max(150),
  description: optionalText(200),
  unit: z
    .string()
    .trim()
    .min(2, inventoryMessages.product.validation.unitRequired)
    .max(20),
  costPrice: z.number().nullish(),
  salePrice: z.number().nullish(),
  minStock: z.number().nullish(),
  active: z.boolean().optional(),

  initialStock: z.number().min(0).optional(),
});

export const updateProductSchema = createProductSchema
  .omit({ initialStock: true })
  .partial()
  .extend({
    costPrice: z.number().optional(),
    salePrice: z.number().optional(),
    minStock: z.number().optional(),
    stock: z.number().optional(),
  });
export const listProductsSchema = paginationSchema;

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsSchema>;

// Movimientos

export const createEntrySchema = z.object({
  // reference: z.string().trim().max(60).optional(),
  notes: optionalText(225),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z
          .number()
          .positive(inventoryMessages.movent.validation.positive),
        unitCost: z
          .number()
          .min(0, inventoryMessages.movent.validation.costPositive),
      }),
    )
    .min(1, inventoryMessages.movent.validation.productRequired)
    .refine(
      (items) => new Set(items.map((i) => i.productId)).size === items.length,
      inventoryMessages.movent.validation.productDuplicate,
    ),
});

export const listMovementsSchema = paginationSchema
  .omit({ status: true })
  .extend({
    reason: z.enum(MOVEMENT_REASONS).optional(),
    productId: z.coerce.number().int().positive().optional(),
    from: z.iso.date().optional(), //z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    to: z.iso.date().optional(),
  })
  .refine((d) => !d.from || !d.to || d.from <= d.to, {
    message: "La fecha inicial no puede ser posterior a la final",
    path: ["from"],
  });

export type CreateEntryDTO = z.infer<typeof createEntrySchema>;
export type ListMovementsQuery = z.infer<typeof listMovementsSchema>;
