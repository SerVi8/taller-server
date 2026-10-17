import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("work_order_items", {
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    ...timestamps,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("work_order_items");
};
