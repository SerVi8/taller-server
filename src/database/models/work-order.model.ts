import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../../config/database.js";

export const WORK_ORDER_STATUS = [
  "price",
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUS)[number];

export class WorkOrder extends Model<
  InferAttributes<WorkOrder>,
  InferCreationAttributes<WorkOrder>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare vehicleId: ForeignKey<number>;
  declare clientId: ForeignKey<number>;
  // declare mechanicId: ForeignKey<number> | null;
  declare status: CreationOptional<WorkOrderStatus>;
  declare mileageIn: number;
  declare mileageOut: number | null;
  declare complaint: string;
  declare diagnosis: string | null;
  declare observations: CreationOptional<string | null>;
  declare recommendations: CreationOptional<string | null>;
  declare discount: CreationOptional<number>;
  declare total: CreationOptional<number>;
  declare openedAt: CreationOptional<Date>;
  declare completedAt: Date | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // mechanicId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    status: {
      type: DataTypes.ENUM(...WORK_ORDER_STATUS),
      allowNull: false,
      defaultValue: "open",
    },
    mileageIn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mileageOut: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    complaint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
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
    openedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "work_orders",
    validate: {
      mileageOutValid(this: WorkOrder) {
        if (this.mileageOut !== null && this.mileageOut < this.mileageIn) {
          throw new Error("El kilometraje final no puede ser menor al inicial");
        }
      },
    },
    indexes: [{ fields: ["vehicle_id", "status"] }, { fields: ["status"] }],
  },
);
