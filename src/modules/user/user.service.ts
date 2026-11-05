import bcrypt from "bcryptjs";
import { Op, type WhereOptions } from "sequelize";
import { User } from "../../database/models/index.js";
import { buildMeta } from "../../shared/schemas/common.schema.js";
import { omitUndefined } from "../../shared/utils/omitUndefined.js";
import { mapUserPersistenceError, userErrors } from "./user.errors.js";
import type {
  CreateUserDto,
  ListUsersQuery,
  UpdatePasswordDto,
  UpdateUserDto,
} from "./user.schema.js";

export const list = async ({
  page,
  limit,
  q,
  role,
  status,
}: ListUsersQuery) => {
  const where: WhereOptions = {};

  if (status !== "all") {
    Object.assign(where, { active: status === "active" });
  }

  if (role && role !== "all") {
    Object.assign(where, { role });
  }

  if (q) {
    const like = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ name: like }, { email: like }],
    });
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { data: rows, meta: buildMeta(count, page, limit) };
};

export const getById = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) throw userErrors.notFound();
  return user;
};

export const create = async (data: CreateUserDto) => {
  const existingName = await User.findOne({ where: { name: data.name } });
  if (existingName) throw userErrors.duplicateUsername();

  const existingEmail = await User.findOne({ where: { email: data.email } });
  if (existingEmail) throw userErrors.duplicateEmail();

  const passwordHash = await bcrypt.hash(data.password, 12);

  return runUserOperation(() =>
    User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? "mecanico",
      active: data.active ?? true,
    }),
  );
};

export const update = async (
  id: number,
  data: UpdateUserDto,
  actorId: number,
) => {
  const user = await User.findByPk(id);
  if (!user) throw userErrors.notFound();

  const losingAdmin =
    user.role === "admin" &&
    (data.role === "mecanico" || data.active === false);

  if (losingAdmin) {
    if (id === actorId) {
      throw userErrors.cannotRemoveOwnAdmin();
    }
    const admins = await User.count({ where: { role: "admin", active: true } });
    if (admins <= 1) {
      throw userErrors.lastActiveAdmin();
    }
  }

  if (data.name && data.name !== user.name) {
    const existingName = await User.findOne({
      where: { name: data.name, id: { [Op.ne]: id } },
    });
    if (existingName) throw userErrors.duplicateUsername();
  }

  if (data.email && data.email !== user.email) {
    const existingEmail = await User.findOne({
      where: { email: data.email, id: { [Op.ne]: id } },
    });
    if (existingEmail) throw userErrors.duplicateEmail();
  }

  return runUserOperation(() => user.update(omitUndefined(data)));
};

export const updatePassword = async (
  id: number,
  { password }: UpdatePasswordDto,
) => {
  const user = await User.findByPk(id);
  if (!user) throw userErrors.notFound();

  const passwordHash = await bcrypt.hash(password, 12);
  await user.update({ passwordHash });
};

export const remove = async (id: number, actorId: number) => {
  await update(id, { active: false }, actorId);
};

async function runUserOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapUserPersistenceError(error);
  }
}
