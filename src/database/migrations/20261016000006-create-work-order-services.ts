import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("work_order_services", {
    id: idColumn,
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "work_orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: { type: DataTypes.STRING(150), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ...timestamps,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("work_order_services");
};
