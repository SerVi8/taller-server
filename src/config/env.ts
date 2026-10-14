import "dotenv/config";
import { StringValue } from "ms";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string(),

  CORS_ORIGIN: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h").transform((v) => v as StringValue),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Variables de entorno inválidas:");

  console.error(result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;