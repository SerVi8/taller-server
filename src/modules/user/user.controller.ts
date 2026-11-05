import type { Request, Response } from "express";
import { idParamSchema } from "../../shared/schemas/common.schema.js";
import {
  createUserSchema,
  listUsersSchema,
  updatePasswordSchema,
  updateUserSchema,
} from "./user.schema.js";
import * as service from "./user.service.js";

export const list = async (req: Request, res: Response) => {
  res.json(await service.list(listUsersSchema.parse(req.query)));
};

export const getById = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  res.json(await service.getById(id));
};

export const create = async (req: Request, res: Response) => {
  const user = await service.create(createUserSchema.parse(req.body));
  res.status(201).json(user);
};

export const update = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = updateUserSchema.parse(req.body);
  res.json(await service.update(id, data, req.user!.id));
};

export const updatePassword = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = updatePasswordSchema.parse(req.body);
  await service.updatePassword(id, data);
  res.status(204).send();
};

export const remove = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  await service.remove(id, req.user!.id);
  res.status(204).send();
};
