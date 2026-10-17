import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("clients", {
    id: idColumn,
    name: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: true, unique: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...timestamps,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("clients");
};
