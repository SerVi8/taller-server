import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("products", {
    id: idColumn,
    sku: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    unit: { type: DataTypes.STRING(20), allowNull: false },
    cost_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    sale_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    min_stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...timestamps,
  });
  await qi.addIndex("products", ["name"]);

  // Red de seguridad: aunque el servicio falle, la BD no permite stock negativo
  await qi.sequelize.query(
    "ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0)",
  );
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("products");
};
