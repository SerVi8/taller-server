import { z } from "zod";
import {
  optionalText,
  paginationSchema,
} from "../../shared/schemas/common.schema.js";
import { WORK_ORDER_STATUS } from "../../database/models/work-order.model.js";
import { workOrderMessages } from "./work-order.messages.js";

export const orderIdOrCodeParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const serviceParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
});

export const itemParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});

export const workOrderServiceInputSchema = z.object({
  title: optionalText(150),
  description: z
    .string()
    .trim()
    .min(1, workOrderMessages.validation.serviceDescriptionRequired),
  price: z
    .number()
    .min(0, workOrderMessages.validation.servicePricePositive)
    .default(0),
  complete: z.boolean().optional().default(false),
});

export const updateOrderServiceSchema = workOrderServiceInputSchema.partial();

export const workOrderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z
    .number()
    .int()
    .positive(workOrderMessages.validation.itemQuantityPositive),
  unitPrice: z
    .number()
    .min(0, workOrderMessages.validation.itemPricePositive)
    .optional(),
});

export const updateOrderItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive(workOrderMessages.validation.itemQuantityPositive),
  unitPrice: z
    .number()
    .min(0, workOrderMessages.validation.itemPricePositive)
    .optional(),
});

export const createOrderSchema = z.object({
  vehicleId: z
    .number()
    .int()
    .positive(workOrderMessages.validation.vehicleRequired),
  status: z.enum(WORK_ORDER_STATUS).optional().default("open"),
  mileageIn: z
    .number()
    .int()
    .min(0, workOrderMessages.validation.mileageInInvalid),
  complaint: z
    .string()
    .trim()
    .min(1, workOrderMessages.validation.complaintRequired),
  diagnosis: optionalText(2000),
  observations: optionalText(2000),
  recommendations: optionalText(2000),
  discount: z
    .number()
    .min(0, workOrderMessages.validation.discountPositive)
    .optional()
    .default(0),
  services: z.array(workOrderServiceInputSchema).default([]),
  items: z
    .array(workOrderItemInputSchema)
    .refine(
      (items) => new Set(items.map((i) => i.productId)).size === items.length,
      workOrderMessages.validation.productDuplicate,
    )
    .default([]),
});

export const updateOrderSchema = z.object({
  complaint: z
    .string()
    .trim()
    .min(1, workOrderMessages.validation.complaintRequired)
    .optional(),
  diagnosis: optionalText(2000),
  observations: optionalText(2000),
  recommendations: optionalText(2000),
  discount: z
    .number()
    .min(0, workOrderMessages.validation.discountPositive)
    .optional(),
});

export const completeOrderSchema = z.object({
  mileageOut: z
    .number()
    .int()
    .min(0, workOrderMessages.validation.mileageOutInvalid),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, workOrderMessages.validation.cancelReasonRequired)
    .max(500),
});

export const listOrdersSchema = paginationSchema
  .omit({ status: true })
  .extend({
    status: z.enum([...WORK_ORDER_STATUS, "all"]).default("all"),
    clientId: z.coerce.number().int().positive().optional(),
    vehicleId: z.coerce.number().int().positive().optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .refine((d) => !d.from || !d.to || d.from <= d.to, {
    message: workOrderMessages.validation.invalidDateRange,
    path: ["from"],
  });

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>;
export type CompleteOrderDTO = z.infer<typeof completeOrderSchema>;
export type CancelOrderDTO = z.infer<typeof cancelOrderSchema>;
export type CreateOrderServiceDTO = z.infer<typeof workOrderServiceInputSchema>;
export type UpdateOrderServiceDTO = z.infer<typeof updateOrderServiceSchema>;
export type CreateOrderItemDTO = z.infer<typeof workOrderItemInputSchema>;
export type UpdateOrderItemDTO = z.infer<typeof updateOrderItemSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>;
