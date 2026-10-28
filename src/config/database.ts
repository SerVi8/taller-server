import dns from "node:dns";
import { Sequelize, type Options } from "sequelize";
import { env } from "./env.js";

// Fuerza IPv4 primero para plataformas como Render que no tienen salida IPv6
dns.setDefaultResultOrder("ipv4first");

const useSsl = env.DATABASE_SSL ?? env.NODE_ENV === "production";

const commonOptions: Options = {
  dialect: "postgres",
  logging: false,
  ...(useSsl && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
  define: {
    timestamps: true,
    underscored: true,
  },
};

export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, commonOptions)
  : new Sequelize({
      database: env.DATABASE_NAME,
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      ...commonOptions,
    });
