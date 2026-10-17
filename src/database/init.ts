import { sequelize } from "../config/database.js";
import "./models/index.js"; // registra modelos y asociaciones
import { seedAdmin } from "./seeders/admin.seeder.js";

export const initDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  console.log("✅ Base de datos conectada");

  await seedAdmin();
};
