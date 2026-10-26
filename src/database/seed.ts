import { sequelize } from "../config/database.js";
import "./models/index.js";
import { seedAdmin } from "./seeders/admin.seeder.js";
import { seedClientsAndVehicles } from "./seeders/clients.seeder.js";
import { seedProducts } from "./seeders/products.seeder.js";
import { seedWorkOrders } from "./seeders/work-orders.seeder.js";

const runSeeders = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("🌱 Iniciando seeders de datos de prueba...");

    await seedAdmin();

    await sequelize.transaction(async (transaction) => {
      const { vehicles } = await seedClientsAndVehicles(transaction);
      const products = await seedProducts(transaction);
      // await seedWorkOrders(vehicles, products, transaction);
    });

    console.log("🎉 Seeders ejecutados correctamente.");
  } catch (error) {
    const err = error as Error & { cause?: { parent?: { message?: string } } };
    console.error("❌ Error ejecutando seeders:", err.message);
    if (err.cause?.parent?.message) {
      console.error("   Detalle:", err.cause.parent.message);
    }
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

void runSeeders();
