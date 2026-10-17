import { sequelize } from "../config/database.js";
import { env } from "../config/env.js";
import { migrator } from "./migrator.js";

// "20261016000002-create-clients.ts" → { action: "create", table: "CLIENTS" }
const describe = (name: string) => {
  const match = name
    .replace(/\.(ts|js)$/, "")
    .match(/^\d+-(create|add|drop)-(.+)$/);
  const action = match?.[1] ?? "migration";
  const target = (match?.[2] ?? name).replace(/-/g, "_").toUpperCase();
  return { action, target };
};

migrator.on("migrated", ({ name }) => {
  const { action, target } = describe(name);
  const label =
    action === "create" ? "TABLA" : action === "add" ? "CAMBIO" : "MIGRACIÓN";
  console.log(
    `---- ${label} ${target} ${action === "create" ? "CREADA" : "APLICADO"} ----`,
  );
});

migrator.on("reverted", ({ name }) => {
  const { action, target } = describe(name);
  console.log(
    action === "create"
      ? `---- TABLA ${target} ELIMINADA ----`
      : `---- ${target} REVERTIDO ----`,
  );
});

const run = async (): Promise<void> => {
  const command = process.argv[2] ?? "up";

  try {
    switch (command) {
      case "up": {
        const done = await migrator.up();
        if (done.length === 0)
          console.log("Todo está al día, no hay migraciones pendientes");
        break;
      }
      case "down":
        console.log("Eliminando tablas...");
        await migrator.down();
        break;
      case "status":
        console.log(
          "Ejecutadas:",
          (await migrator.executed()).map((m) => m.name),
        );
        console.log(
          "Pendientes:",
          (await migrator.pending()).map((m) => m.name),
        );
        break;
      case "reset":
        if (env.NODE_ENV === "production") {
          throw new Error("reset no está permitido en producción");
        }
        console.log("Eliminando tablas...");
        await migrator.down({ to: 0 });
        console.log("Creando tablas...");
        await migrator.up();
        break;
      default:
        throw new Error(`Comando desconocido: ${command}`);
    }
  } catch (error) {
    // Solo el error, sin el stack interminable de Sequelize
    const err = error as Error & { cause?: { parent?: { message?: string } } };
    console.error("❌ Error en migraciones:", err.message);
    const detail = err.cause?.parent?.message;
    if (detail) console.error("   Detalle:", detail);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

void run();
