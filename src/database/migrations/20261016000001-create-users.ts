import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("users", {
    id: idColumn,
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "mecanico"),
      allowNull: false,
      defaultValue: "mecanico",
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...timestamps,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("users");
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
};
