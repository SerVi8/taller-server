import { Op, Transaction, WhereOptions } from "sequelize";
import { Product } from "../../database/models/product.model.js";
import { buildMeta } from "../../shared/schemas/common.schema.js";
import {
  inventoryErrors,
  mapInventoryPersistenceError,
} from "./inventory.errors.js";
import {
  CreateProductDTO,
  ListProductsQuery,
  UpdateProductDTO,
} from "./product.schema.js";
import { sequelize } from "../../config/database.js";
import { StockMovement } from "../../database/models/stock-movement.model.js";
import { omitUndefined } from "../../shared/utils/omitUndefined.js";

export const list = async ({ page, limit, q, status }: ListProductsQuery) => {
  const where: WhereOptions = {};

  if (status !== "all") Object.assign(where, { active: status === "active" });

  if (q) {
    const like = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ sku: like }, { name: like }],
    });
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { data: rows, meta: buildMeta(count, page, limit) };
};

export const getById = async (id: number) => {
  const client = await Product.findByPk(id);
  if (!client) throw inventoryErrors.notFound();
  return client;
};
export const create = async (data: CreateProductDTO) => {
  const product = await runProductTransaction(() =>
    sequelize.transaction(async (transaction) => {
      const created = await Product.create(
        {
          sku: data.sku,
          name: data.name,
          description: data.description ?? null,
          unit: data.unit,
          costPrice: data.costPrice ?? 0,
          salePrice: data.salePrice ?? 0,
          minStock: data.minStock ?? 0,
          active: data.active ?? true,
          stock: data.initialStock ?? 0,
        },
        { transaction },
      );
      if (data.initialStock) {
        await StockMovement.create(
          {
            productId: created.id,
            quantity: String(data.initialStock),
            reason: "adjustment",
            notes: "Stock inicial",
            workOrderId: null,
          },
          { transaction },
        );
      }
      return created;
    }),
  );
  return getById(product.id);
};

export const update = async (id: number, data: UpdateProductDTO) => {
  const product = await Product.findByPk(id);
  if (!product) throw inventoryErrors.notFound();

  await runProductTransaction(() =>
    sequelize.transaction(async (transaction) => {
      await product.update(omitUndefined(data), { transaction });
    }),
  );
  return getById(id);
};

export const remove = async (id: number) => {
  await update(id, { active: false });
};

async function runProductTransaction<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapInventoryPersistenceError(error);
  }
}
