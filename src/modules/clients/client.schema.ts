import { z } from "zod";
import {
  optionalText,
  paginationSchema,
} from "../../shared/schemas/common.schema.js";
import { clientMessages } from "./client.messages.js";

const email = z
  .union([
    z.literal("").transform(() => null),
    z
      .string()
      .trim()
      .toLowerCase()
      .email(clientMessages.validation.invalidEmail)
      .max(150),
  ])
  .nullish();

export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, clientMessages.validation.nameRequired)
    .max(150),
  phone: z
    .string()
    .trim()
    .min(1, clientMessages.validation.phoneRequired)
    .max(30),
  email,
  active: z.boolean().optional(),
  vehicles: z
    .array(
      z.object({
        plate: z
          .string()
          .trim()
          .min(1, clientMessages.validation.plateRequired)
          .max(15),
        model: optionalText(50),
        year: z
          .number()
          .int()
          .min(1886)
          .max(new Date().getFullYear() + 1)
          .nullable()
          .optional(),
        color: optionalText(30),
      }),
    )
    .default([]),
});

export const updateClientSchema = createClientSchema.partial().extend({
  active: z.boolean().optional(),
  vehicles: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        plate: z
          .string()
          .trim()
          .min(1, clientMessages.validation.plateRequired)
          .max(15),
        model: optionalText(50),
        year: z
          .number()
          .int()
          .min(1886)
          .max(new Date().getFullYear() + 1)
          .nullable()
          .optional(),
        color: optionalText(30),
      }),
    )
    .optional(),
});

export const listClientsSchema = paginationSchema;

export type CreateClientDto = z.infer<typeof createClientSchema>;
export type UpdateClientDto = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsSchema>;
