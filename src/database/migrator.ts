import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SequelizeStorage, Umzug } from "umzug";
import { sequelize } from "../config/database.js";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

export const migrator = new Umzug({
  migrations: {
    glob: ["*.{ts,js}", { cwd: migrationsDir, ignore: ["**/*.d.ts"] }],
    // Import dinámico: necesario para ESM
    resolve: ({ name, path: filePath }) => {
      const load = () =>
        import(pathToFileURL(path.resolve(migrationsDir, filePath!)).href);
      return {
        name,
        up: async (params) => (await load()).up(params),
        down: async (params) => (await load()).down(params),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: "schema_migrations" }),
  logger: undefined,
});

export type Migration = typeof migrator._types.migration;
