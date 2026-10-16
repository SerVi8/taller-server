import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../../config/database.js";

export const MOVEMENT_REASONS = [
  "purchase",
  "work_order",
  "return",
  "adjustment",
] as const;
export type MovementReason = (typeof MOVEMENT_REASONS)[number];

export class StockMovement extends Model<
  InferAttributes<StockMovement>,
  InferCreationAttributes<StockMovement>
> {
  declare id: CreationOptional<number>;
  declare productId: ForeignKey<number>;
  declare quantity: string; // con signo: + entra, - sale
  declare reason: MovementReason;
  declare workOrderId: ForeignKey<number> | null;
  // declare userId: ForeignKey<number>;
  declare unitCost: string | null;
  declare notes: string | null;

  declare readonly createdAt: CreationOptional<Date>;
}

StockMovement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notZero: (v: string) => {
          if (Number(v) === 0) throw new Error("La cantidad no puede ser 0");
        },
      },
    },
    reason: {
      type: DataTypes.ENUM(...MOVEMENT_REASONS),
      allowNull: false,
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // userId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    unitCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "stock_movements",
    updatedAt: false, // los movimientos no se editan
    indexes: [{ fields: ["product_id", "created_at"] }],
  },
);
