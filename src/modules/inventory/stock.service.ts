import { Op, Transaction, WhereOptions } from "sequelize";
import { sequelize } from "../../config/database.js";
import {
  MovementReason,
  StockMovement,
} from "../../database/models/stock-movement.model.js";
import { CreateEntryDTO, ListMovementsQuery } from "./product.schema.js";
import { Product } from "../../database/models/product.model.js";
import { inventoryErrors } from "./inventory.errors.js";
import { buildMeta } from "../../shared/schemas/common.schema.js";

export const stockMovement = async ({
  page,
  limit,
  q,
  productId,
  from,
  to,
  reason,
}: ListMovementsQuery) => {
  const where: WhereOptions = {};

  if (reason) Object.assign(where, { reason });
  if (productId) Object.assign(where, { productId });

  if (from || to) {
    Object.assign(where, {
      createdAt: {
        ...(from && { [Op.gte]: new Date(`${from}T00:00:00`) }),
        ...(to && { [Op.lt]: nextDay(to) }),
      },
    });
  }

  if (q) {
    const like = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ "$product.name$": like }, { "$product.sku$": like }],
    });
  }

  const { rows, count } = await StockMovement.findAndCountAll({
    where,
    include: [
      {
        association: "product",
        attributes: ["id", "name", "sku", "unit"],
        required: true,
      },
      { association: "workOrder", attributes: ["id", "code"], required: false },
    ],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
    subQuery: false,
  });

  return { data: rows, meta: buildMeta(count, page, limit) };
};
export const createEntry = async (data: CreateEntryDTO, userId: number) => {
  return sequelize.transaction(async (transaction) => {
    for (const item of data.items) {
      await moveStock({
        productId: item.productId,
        quantity: item.quantity, // positivo: entra
        reason: "purchase",
        unitCost: String(item.unitCost),
        notes: data.notes ?? null,
        transaction,
      });

      // Último costo: la compra actualiza el costo del producto
      await Product.update(
        { costPrice: item.unitCost },
        { where: { id: item.productId }, transaction },
      );
    }

    return { lines: data.items.length };
  });
};

export const moveStock = async ({
  productId,
  quantity,
  reason,
  workOrderId = null,
  unitCost = null,
  notes = null,
  transaction,
}: MoveStockInput) => {
  const product = await Product.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE, // evita carreras entre dos movimientos simultáneos
  });
  if (!product) throw inventoryErrors.notFound();

  const newStock = Number(product.stock) + quantity;

  if (newStock < 0) {
    throw inventoryErrors.noStock(product);
  }

  await StockMovement.create(
    {
      productId,
      quantity: String(quantity),
      reason,
      workOrderId,
      unitCost,
      notes,
    },
    { transaction },
  );

  await product.update({ stock: newStock }, { transaction });
  return product;
};

interface MoveStockInput {
  productId: number;
  quantity: number; // con signo: + entra, - sale
  reason: MovementReason;
  workOrderId?: number | null;
  unitCost?: string | null;
  notes?: string | null;
  transaction: Transaction; // obligatorio: nunca se mueve stock fuera de una transacción
}
const nextDay = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d;
};
