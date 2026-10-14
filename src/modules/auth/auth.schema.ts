import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim(),

  password: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;