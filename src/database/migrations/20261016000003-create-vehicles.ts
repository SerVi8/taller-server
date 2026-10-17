import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("vehicles", {
    id: idColumn,
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    plate: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    model: { type: DataTypes.STRING(50), allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    color: { type: DataTypes.STRING(30), allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...timestamps,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("vehicles");
};
