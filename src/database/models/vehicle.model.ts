import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../../config/database.js";

export class Vehicle extends Model<
  InferAttributes<Vehicle>,
  InferCreationAttributes<Vehicle>
> {
  declare id: CreationOptional<number>;
  declare clientId: ForeignKey<string>;
  declare plate: string;
  declare model: string | null;
  declare year: number | null;
  declare color: string | null;
  declare active: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plate: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false,
      set(value: string) {
        this.setDataValue("plate", value.trim().toUpperCase());
      },
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "vehicles",
  },
);
