import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../../config/database.js";

export class WorkOrderService extends Model<
  InferAttributes<WorkOrderService>,
  InferCreationAttributes<WorkOrderService>
> {
  declare id: CreationOptional<number>;
  declare workOrderId: ForeignKey<string>;
  declare title: CreationOptional<string>;
  declare description: string | null;
  declare price: CreationOptional<number>;
  declare complete: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

WorkOrderService.init(
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    workOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
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

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "work_order_services",
  },
);
