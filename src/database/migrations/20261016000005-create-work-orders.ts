import { DataTypes } from "sequelize";
import { idColumn, timestamps } from "../helpers/columns.js";
import type { Migration } from "../migrator.js";

export const up: Migration = async ({ context: qi }) => {
  await qi.createTable("work_orders", {
    id: idColumn,
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "vehicles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
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
    status: {
      type: DataTypes.ENUM(
        "price",
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ),
      allowNull: false,
      defaultValue: "open",
    },
    mileage_in: { type: DataTypes.INTEGER, allowNull: false },
    mileage_out: { type: DataTypes.INTEGER, allowNull: true },
    complaint: { type: DataTypes.TEXT, allowNull: false },
    diagnosis: { type: DataTypes.TEXT, allowNull: true },
    observations: { type: DataTypes.TEXT, allowNull: true },
    recommendations: { type: DataTypes.TEXT, allowNull: true },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    ...timestamps,
  });
  await qi.sequelize.query(`
    ALTER TABLE work_orders
      ADD CONSTRAINT work_orders_mileage_valid
        CHECK (mileage_out IS NULL OR mileage_out >= mileage_in),
      ADD CONSTRAINT work_orders_discount_valid CHECK (discount >= 0)
  `);
};

export const down: Migration = async ({ context: qi }) => {
  await qi.dropTable("work_orders");
  await qi.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_status"');
};
