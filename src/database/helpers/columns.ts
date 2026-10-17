import { DataTypes, fn, type ModelAttributeColumnOptions } from "sequelize";

export const idColumn: ModelAttributeColumnOptions = {
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
};

export const foreignKey = (
  table: string,
  opts: {
    allowNull?: boolean;
    onDelete?: "RESTRICT" | "CASCADE" | "SET NULL";
  } = {},
): ModelAttributeColumnOptions => ({
  type: DataTypes.INTEGER,
  allowNull: opts.allowNull ?? false,
  references: { model: table, key: "id" },
  onDelete: opts.onDelete ?? "RESTRICT",
  onUpdate: "CASCADE",
});

export const timestamps: Record<string, ModelAttributeColumnOptions> = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: fn("now"),
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: fn("now"),
  },
};
