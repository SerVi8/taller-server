import { sequelize } from "../config/database.js";
import { env } from "../config/env.js";
import { migrator } from "./migrator.js";
import "./models/index.js"; // registra modelos y asociaciones
import { seedAdmin } from "./seeders/admin.seeder.js";
import { seedClientsAndVehicles } from "./seeders/clients.seeder.js";
import { seedProducts } from "./seeders/products.seeder.js";

export const initDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  console.log("✅ Base de datos conectada");

  await migrator.up();
  await seedAdmin();

  if (env.SEED_DEMO_DATA) {
    await sequelize.transaction(async (transaction) => {
      await seedClientsAndVehicles(transaction);
      await seedProducts(transaction);
    });
  }
};
