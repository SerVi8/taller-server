import { DataTypes } from "sequelize";
import { idColumn } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("stock_movements", {
    id: idColumn,
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    reason: {
      type: DataTypes.ENUM("purchase", "work_order", "return", "adjustment"),
      allowNull: false,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "work_orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    unit_cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    notes: { type: DataTypes.STRING(255), allowNull: true },
    created_at: DataTypes.DATE,
  });
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("stock_movements");
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_stock_movements_reason"');
};
