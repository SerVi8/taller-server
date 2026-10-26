import { Request, Response } from "express";
import {
  createEntrySchema,
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "./product.schema.js";
import * as productService from "./product.service.js";
import * as stockService from "./stock.service.js";
import { idParamSchema } from "../../shared/schemas/common.schema.js";

export const list = async (req: Request, res: Response) => {
  res.json(await productService.list(listProductsSchema.parse(req.query)));
};

export const getById = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await productService.getById(id));
};

export const create = async (req: Request, res: Response) => {
  const client = await productService.create(
    createProductSchema.parse(req.body),
  );
  res.status(201).json(client);
};

export const update = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(
    await productService.update(id, updateProductSchema.parse(req.body)),
  );
};

export const remove = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  await productService.remove(id);
  res.status(204).send();
};

// Moviminetos

export const stockMovements = async (req: Request, res: Response) => {
  res.json(
    await stockService.stockMovement(listProductsSchema.parse(req.query)),
  );
};

export const createEntry = async (req: Request, res: Response) => {
  const dto = createEntrySchema.parse(req.body);
  res.status(201).json(await stockService.createEntry(dto, req.user!.id));
};
