import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize({
  database: env.DATABASE_NAME,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,

  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,

  dialect: "postgres",

  logging: env.NODE_ENV === "development" ? console.log : false,

  define: {
    timestamps: true,
    underscored: true,
  },
});