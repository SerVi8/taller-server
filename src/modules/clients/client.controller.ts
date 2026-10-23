import type { Request, Response } from "express";
import { idParamSchema } from "../../shared/schemas/common.schema.js";
import * as service from "./client.service.js";
import {
  createClientSchema,
  listClientsSchema,
  updateClientSchema,
} from "./client.schema.js";

export const list = async (req: Request, res: Response) => {
  res.json(await service.list(listClientsSchema.parse(req.query)));
};

export const getById = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await service.getById(id));
};

export const create = async (req: Request, res: Response) => {
  const client = await service.create(createClientSchema.parse(req.body));
  res.status(201).json(client);
};

export const update = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await service.update(id, updateClientSchema.parse(req.body)));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).send();
};
