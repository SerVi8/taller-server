import { randomUUID } from "node:crypto";
import { Op, type Transaction, type WhereOptions } from "sequelize";
import { sequelize } from "../../config/database.js";
import {
  Vehicle,
  WorkOrder,
  WorkOrderItem,
  WorkOrderService,
} from "../../database/models/index.js";
import { buildMeta } from "../../shared/schemas/common.schema.js";
import { omitUndefined } from "../../shared/utils/omitUndefined.js";
import { moveStock } from "../inventory/stock.service.js";
import {
  mapWorkOrderPersistenceError,
  workOrderErrors,
} from "./work-order.errors.js";
import type {
  CancelOrderDTO,
  CompleteOrderDTO,
  CreateOrderDTO,
  CreateOrderItemDTO,
  CreateOrderServiceDTO,
  ListOrdersQuery,
  UpdateOrderDTO,
  UpdateOrderItemDTO,
  UpdateOrderServiceDTO,
} from "./work-order.schema.js";

export const list = async ({
  page,
  limit,
  q,
  status,
  clientId,
  vehicleId,
  from,
  to,
}: ListOrdersQuery) => {
  const where: WhereOptions = {};

  if (status !== "all") Object.assign(where, { status });
  if (clientId) Object.assign(where, { clientId });
  if (vehicleId) Object.assign(where, { vehicleId });

  if (from || to) {
    Object.assign(where, {
      openedAt: {
        ...(from && { [Op.gte]: new Date(`${from}T00:00:00`) }),
        ...(to && { [Op.lt]: nextDay(to) }),
      },
    });
  }

  if (q) {
    const like = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [
        { code: like },
        { complaint: like },
        { "$vehicle.plate$": like },
        { "$vehicle.model$": like },
        { "$client.name$": like },
        { "$client.phone$": like },
      ],
    });
  }

  const { rows, count } = await WorkOrder.findAndCountAll({
    where,
    include: [
      {
        association: "client",
        attributes: ["id", "name", "phone", "email"],
        required: true,
      },
      {
        association: "vehicle",
        attributes: ["id", "plate", "model", "year", "color"],
        required: true,
      },
    ],
    order: [
      ["openedAt", "DESC"],
      ["id", "DESC"],
    ],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
    subQuery: false,
  });

  return { data: rows, meta: buildMeta(count, page, limit) };
};

export const getById = async (idOrCode: number | string) => {
  const isNumeric = typeof idOrCode === "number" || /^\d+$/.test(idOrCode);
  const order = await WorkOrder.findOne({
    where: isNumeric
      ? { id: Number(idOrCode) }
      : { code: String(idOrCode).toUpperCase() },
    include: [
      {
        association: "client",
        attributes: ["id", "name", "phone", "email", "active"],
      },
      {
        association: "vehicle",
        attributes: ["id", "plate", "model", "year", "color", "active"],
      },
      {
        association: "services",
      },
      {
        association: "items",
        include: [
          {
            association: "product",
            attributes: ["id", "sku", "name", "unit", "salePrice"],
          },
        ],
      },
      {
        association: "stockMovements",
        include: [
          {
            association: "product",
            attributes: ["id", "sku", "name", "unit"],
          },
        ],
      },
    ],
    order: [
      [{ model: WorkOrderService, as: "services" }, "id", "ASC"],
      [{ model: WorkOrderItem, as: "items" }, "id", "ASC"],
    ],
  });

  if (!order) throw workOrderErrors.notFound();
  return order;
};

export const create = async (data: CreateOrderDTO, _userId?: number) => {
  const created = await runWorkOrderTransaction(() =>
    sequelize.transaction(async (transaction) => {
      const vehicle = await Vehicle.findByPk(data.vehicleId, { transaction });
      if (!vehicle || !vehicle.active) {
        throw workOrderErrors.vehicleNotFound();
      }

      // Un vehículo no puede tener dos órdenes abiertas a la vez
      const openOrder = await WorkOrder.findOne({
        where: {
          vehicleId: vehicle.id,
          status: { [Op.in]: ["open", "in_progress"] },
        },
        transaction,
      });
      if (openOrder) {
        throw workOrderErrors.openOrderConflict(openOrder.code);
      }

      const last = await WorkOrder.findOne({
        where: { vehicleId: vehicle.id, status: "completed" },
        order: [["completedAt", "DESC"]],
        transaction,
      });
      if (last?.mileageOut && data.mileageIn < last.mileageOut) {
        throw workOrderErrors.invalidMileageIn(last.mileageOut);
      }

      const order = await WorkOrder.create(
        {
          code: `TMP-${randomUUID().slice(0, 15)}`,
          vehicleId: vehicle.id,
          clientId: vehicle.clientId, // snapshot del dueño actual
          status: data.status ?? "open",
          mileageIn: data.mileageIn,
          mileageOut: null,
          complaint: data.complaint,
          diagnosis: data.diagnosis ?? null,
          observations: data.observations ?? null,
          recommendations: data.recommendations ?? null,
          discount: data.discount ?? 0,
          total: 0,
          completedAt: null,
        },
        { transaction },
      );

      const code = `OT-${String(order.id).padStart(6, "0")}`;

      if (data.services.length > 0) {
        await WorkOrderService.bulkCreate(
          data.services.map((service) => ({
            workOrderId: order.id,
            title: service.title ?? null,
            description: service.description,
            price: service.price,
            complete: service.complete ?? false,
          })),
          { transaction },
        );
      }

      for (const item of data.items) {
        const product = await moveStock({
          productId: item.productId,
          quantity: -item.quantity,
          reason: "work_order",
          workOrderId: order.id,
          notes: `Orden ${code}`,
          transaction,
        });

        const unitCost = Number(product.costPrice);
        const unitPrice = item.unitPrice ?? Number(product.salePrice);

        await WorkOrderItem.create(
          {
            workOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost,
            unitPrice,
          },
          { transaction },
        );
      }

      await order.update({ code }, { transaction });
      await recalculateOrderTotal(order, transaction, {
        strictDiscount: data.services.length > 0 || data.items.length > 0,
      });
      return order;
    }),
  );

  return getById(created.id);
};

export const update = async (id: number, data: UpdateOrderDTO) => {
  await runWorkOrderTransaction(() =>
    sequelize.transaction(async (transaction) => {
      const order = await getEditableOrder(id, transaction);
      await order.update(omitUndefined(data), { transaction });
      await recalculateOrderTotal(order, transaction, {
        strictDiscount: data.discount !== undefined,
      });
    }),
  );

  return getById(id);
};

export const start = async (id: number) => {
  await sequelize.transaction(async (transaction) => {
    const order = await findOrderOrFail(id, transaction);
    if (order.status !== "open" && order.status !== "price") {
      throw workOrderErrors.cannotStartOrder();
    }

    if (order.status === "price") {
      const openOrder = await WorkOrder.findOne({
        where: {
          vehicleId: order.vehicleId,
          status: { [Op.in]: ["open", "in_progress"] },
          id: { [Op.ne]: order.id },
        },
        transaction,
      });
      if (openOrder) {
        throw workOrderErrors.openOrderConflict(openOrder.code);
      }
    }

    await order.update({ status: "in_progress" }, { transaction });
  });

  return getById(id);
};

export const complete = async (id: number, data: CompleteOrderDTO) => {
  await sequelize.transaction(async (transaction) => {
    const order = await findOrderOrFail(id, transaction);
    if (order.status !== "open" && order.status !== "in_progress") {
      throw workOrderErrors.cannotCompleteOrder();
    }

    if (data.mileageOut < order.mileageIn) {
      throw workOrderErrors.invalidMileageOut(order.mileageIn);
    }

    await order.update(
      {
        status: "completed",
        mileageOut: data.mileageOut,
        completedAt: new Date(),
      },
      { transaction },
    );
  });

  return getById(id);
};

export const cancel = async (id: number, data: CancelOrderDTO) => {
  await sequelize.transaction(async (transaction) => {
    const order = await findOrderOrFail(id, transaction);
    if (order.status === "completed" || order.status === "cancelled") {
      throw workOrderErrors.cannotCancelOrder();
    }

    const items = await WorkOrderItem.findAll({
      where: { workOrderId: order.id },
      transaction,
    });

    for (const item of items) {
      const qty = Number(item.quantity);
      if (qty > 0) {
        await moveStock({
          productId: item.productId,
          quantity: qty,
          reason: "return",
          workOrderId: order.id,
          unitCost: String(item.unitCost),
          notes: `Cancelación ${order.code}: ${data.reason}`,
          transaction,
        });
      }
    }

    const cancelNote = `[Cancelada]: ${data.reason}`;
    const observations = order.observations
      ? `${order.observations}\n${cancelNote}`
      : cancelNote;

    await order.update(
      {
        status: "cancelled",
        observations,
      },
      { transaction },
    );
  });

  return getById(id);
};

// Servicios de la orden

export const addService = async (
  orderId: number,
  data: CreateOrderServiceDTO,
) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);

    await WorkOrderService.create(
      {
        workOrderId: order.id,
        title: data.title ?? null,
        description: data.description,
        price: data.price,
        complete: data.complete ?? false,
      },
      { transaction },
    );

    await recalculateOrderTotal(order, transaction);
  });

  return getById(orderId);
};

export const updateService = async (
  orderId: number,
  serviceId: number,
  data: UpdateOrderServiceDTO,
) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);
    const serviceRow = await WorkOrderService.findOne({
      where: { id: serviceId, workOrderId: order.id },
      transaction,
    });
    if (!serviceRow) throw workOrderErrors.serviceNotFound();

    await serviceRow.update(omitUndefined(data), { transaction });
    await recalculateOrderTotal(order, transaction);
  });

  return getById(orderId);
};

export const removeService = async (orderId: number, serviceId: number) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);
    const serviceRow = await WorkOrderService.findOne({
      where: { id: serviceId, workOrderId: order.id },
      transaction,
    });
    if (!serviceRow) throw workOrderErrors.serviceNotFound();

    await serviceRow.destroy({ transaction });
    await recalculateOrderTotal(order, transaction);
  });
};

// Ítems / Productos de la orden

export const addItem = async (orderId: number, data: CreateOrderItemDTO) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);

    const existing = await WorkOrderItem.findOne({
      where: { workOrderId: order.id, productId: data.productId },
      transaction,
    });
    if (existing) {
      throw workOrderErrors.itemAlreadyExists();
    }

    const product = await moveStock({
      productId: data.productId,
      quantity: -data.quantity,
      reason: "work_order",
      workOrderId: order.id,
      notes: `Orden ${order.code}`,
      transaction,
    });

    await WorkOrderItem.create(
      {
        workOrderId: order.id,
        productId: data.productId,
        quantity: data.quantity,
        unitCost: Number(product.costPrice),
        unitPrice: data.unitPrice ?? Number(product.salePrice),
      },
      { transaction },
    );

    await recalculateOrderTotal(order, transaction);
  });

  return getById(orderId);
};

export const updateItem = async (
  orderId: number,
  itemId: number,
  data: UpdateOrderItemDTO,
) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);
    const item = await WorkOrderItem.findOne({
      where: { id: itemId, workOrderId: order.id },
      transaction,
    });
    if (!item) throw workOrderErrors.itemNotFound();

    const currentQty = Number(item.quantity);
    const diff = data.quantity - currentQty;

    if (diff !== 0) {
      await moveStock({
        productId: item.productId,
        quantity: -diff, // diff > 0 => sale más stock (-diff); diff < 0 => devuelve stock (+|diff|)
        reason: diff > 0 ? "work_order" : "return",
        workOrderId: order.id,
        unitCost: diff < 0 ? String(item.unitCost) : null,
        notes:
          diff > 0
            ? `Aumento de cantidad en orden ${order.code}`
            : `Devolución parcial en orden ${order.code}`,
        transaction,
      });
    }

    await item.update(
      {
        quantity: data.quantity,
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
      },
      { transaction },
    );

    await recalculateOrderTotal(order, transaction);
  });

  return getById(orderId);
};

export const removeItem = async (orderId: number, itemId: number) => {
  await sequelize.transaction(async (transaction) => {
    const order = await getEditableOrder(orderId, transaction);
    const item = await WorkOrderItem.findOne({
      where: { id: itemId, workOrderId: order.id },
      transaction,
    });
    if (!item) throw workOrderErrors.itemNotFound();

    const qty = Number(item.quantity);
    if (qty > 0) {
      await moveStock({
        productId: item.productId,
        quantity: qty, // positivo: suma de vuelta al stock
        reason: "return",
        workOrderId: order.id,
        unitCost: String(item.unitCost),
        notes: `Eliminación de ítem en orden ${order.code}`,
        transaction,
      });
    }

    await item.destroy({ transaction });
    await recalculateOrderTotal(order, transaction);
  });
};

// Helpers internos

async function findOrderOrFail(
  id: number,
  transaction: Transaction,
): Promise<WorkOrder> {
  const order = await WorkOrder.findByPk(id, { transaction });
  if (!order) throw workOrderErrors.notFound();
  return order;
}

async function getEditableOrder(
  id: number,
  transaction: Transaction,
): Promise<WorkOrder> {
  const order = await findOrderOrFail(id, transaction);
  if (order.status === "completed" || order.status === "cancelled") {
    throw workOrderErrors.orderNotEditable();
  }
  return order;
}

async function recalculateOrderTotal(
  order: WorkOrder,
  transaction: Transaction,
  options?: { strictDiscount?: boolean },
) {
  const [services, items] = await Promise.all([
    WorkOrderService.findAll({
      where: { workOrderId: order.id },
      transaction,
    }),
    WorkOrderItem.findAll({
      where: { workOrderId: order.id },
      transaction,
    }),
  ]);

  const servicesSubtotal = services.reduce(
    (acc, service) => acc + Number(service.price),
    0,
  );
  const itemsSubtotal = items.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.unitPrice),
    0,
  );

  const subtotal = servicesSubtotal + itemsSubtotal;
  const discount = Number(order.discount ?? 0);

  if (options?.strictDiscount && subtotal > 0 && discount > subtotal) {
    throw workOrderErrors.invalidDiscount();
  }

  const total = Math.max(0, Number((subtotal - discount).toFixed(2)));
  await order.update({ total }, { transaction });
}

async function runWorkOrderTransaction<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapWorkOrderPersistenceError(error);
  }
}

const nextDay = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d;
};
