import type { Request, Response } from "express";
import { idParamSchema } from "../../shared/schemas/common.schema.js";
import {
  cancelOrderSchema,
  completeOrderSchema,
  createOrderSchema,
  itemParamsSchema,
  listOrdersSchema,
  orderIdOrCodeParamSchema,
  serviceParamsSchema,
  updateOrderItemSchema,
  updateOrderSchema,
  updateOrderServiceSchema,
  workOrderItemInputSchema,
  workOrderServiceInputSchema,
} from "./work-order.schema.js";
import * as service from "./work-order.service.js";

export const list = async (req: Request, res: Response) => {
  res.json(await service.list(listOrdersSchema.parse(req.query)));
};

export const getById = async (req: Request, res: Response) => {
  const { id } = orderIdOrCodeParamSchema.parse(req.params);
  res.json(await service.getById(id));
};

export const create = async (req: Request, res: Response) => {
  const dto = createOrderSchema.parse(req.body);
  const order = await service.create(dto, req.user?.id);
  res.status(201).json(order);
};

export const update = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const dto = updateOrderSchema.parse(req.body);
  res.json(await service.update(id, dto));
};

// Cambios de estado

export const start = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await service.start(id));
};

export const complete = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const dto = completeOrderSchema.parse(req.body);
  res.json(await service.complete(id, dto));
};

export const cancel = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const dto = cancelOrderSchema.parse(req.body);
  res.json(await service.cancel(id, dto));
};

// Servicios de la orden

export const addService = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const dto = workOrderServiceInputSchema.parse(req.body);
  res.status(201).json(await service.addService(id, dto));
};

export const updateService = async (req: Request, res: Response) => {
  const { id, serviceId } = serviceParamsSchema.parse(req.params);
  const dto = updateOrderServiceSchema.parse(req.body);
  res.json(await service.updateService(id, serviceId, dto));
};

export const removeService = async (req: Request, res: Response) => {
  const { id, serviceId } = serviceParamsSchema.parse(req.params);
  await service.removeService(id, serviceId);
  res.status(204).send();
};

// Ítems / Productos de la orden

export const addItem = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const dto = workOrderItemInputSchema.parse(req.body);
  res.status(201).json(await service.addItem(id, dto));
};

export const updateItem = async (req: Request, res: Response) => {
  const { id, itemId } = itemParamsSchema.parse(req.params);
  const dto = updateOrderItemSchema.parse(req.body);
  res.json(await service.updateItem(id, itemId, dto));
};

export const removeItem = async (req: Request, res: Response) => {
  const { id, itemId } = itemParamsSchema.parse(req.params);
  await service.removeItem(id, itemId);
  res.status(204).send();
};
