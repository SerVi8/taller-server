import { z } from "zod";
import { authMessages } from "./auth.messages.js";

export const loginSchema = z.object({
  username: z.string().trim().min(1, authMessages.validation.usernameRequired),
  password: z
    .string()
    .min(1, authMessages.validation.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;
