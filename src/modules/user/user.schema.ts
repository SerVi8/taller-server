import { z } from "zod";
import { USER_ROLES } from "../../database/models/user.model.js";
import { paginationSchema } from "../../shared/schemas/common.schema.js";
import { userMessages } from "./user.messages.js";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, userMessages.validation.nameRequired)
    .max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(userMessages.validation.invalidEmail)
    .max(150),
  password: z
    .string()
    .min(6, userMessages.validation.passwordMinLength)
    .max(100),
  role: z
    .enum(USER_ROLES, { message: userMessages.validation.invalidRole })
    .default("mecanico"),
  active: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, userMessages.validation.nameRequired)
    .max(100)
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(userMessages.validation.invalidEmail)
    .max(150)
    .optional(),
  role: z
    .enum(USER_ROLES, { message: userMessages.validation.invalidRole })
    .optional(),
  active: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, userMessages.validation.passwordMinLength)
    .max(100),
});

export const listUsersSchema = paginationSchema.extend({
  role: z.enum([...USER_ROLES, "all"]).default("all"),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
