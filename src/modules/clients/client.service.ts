import { Op, type WhereOptions } from "sequelize";
import { Client, Vehicle } from "../../database/models/index.js";
import { buildMeta } from "../../shared/schemas/common.schema.js";
import type {
  CreateClientDto,
  ListClientsQuery,
  UpdateClientDto,
} from "./client.schema.js";
import { omitUndefined } from "../../shared/utils/omitUndefined.js";
import { sequelize } from "../../config/database.js";
import { clientErrors, mapClientPersistenceError } from "./client.errors.js";

export const list = async ({ page, limit, q, status }: ListClientsQuery) => {
  const where: WhereOptions = {};

  if (status !== "all") Object.assign(where, { active: status === "active" });

  if (q) {
    const like = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ name: like }, { phone: like }, { email: like }],
    });
  }

  const { rows, count } = await Client.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { data: rows, meta: buildMeta(count, page, limit) };
};

export const getById = async (id: number) => {
  const client = await Client.findByPk(id, {
    include: [
      { association: "vehicles", where: { active: true }, required: false },
    ],
  });
  if (!client) throw clientErrors.notFound();
  return client;
};

export const create = async (data: CreateClientDto) => {
  const client = await runClientTransaction(() =>
    sequelize.transaction(async (transaction) => {
      const created = await Client.create(
        {
          name: data.name,
          phone: data.phone,
          email: data.email ?? null,
          active: data.active ?? true,
        },
        { transaction },
      );
      if (data.vehicles.length) {
        await Vehicle.bulkCreate(
          data.vehicles.map((vehicle) => ({
            ...vehicle,
            clientId: created.id,
            model: vehicle.model ?? null,
            year: vehicle.year ?? null,
            color: vehicle.color ?? null,
          })),
          { transaction },
        );
      }
      return created;
    }),
  );
  return getById(client.id);
};

export const update = async (id: number, data: UpdateClientDto) => {
  const client = await Client.findByPk(id);
  if (!client) throw clientErrors.notFound();

  if (data.active === false) {
    const vehicles = await Vehicle.count({
      where: { clientId: id, active: true },
    });
    if (vehicles > 0) {
      throw clientErrors.activeVehicles();
    }
  }

  await runClientTransaction(() =>
    sequelize.transaction(async (transaction) => {
      const { vehicles, ...clientData } = data;
      await client.update(omitUndefined(clientData), { transaction });

      if (vehicles) {
        const current = await Vehicle.findAll({
          where: { clientId: id, active: true },
          transaction,
        });
        const incomingIds = vehicles.flatMap((vehicle) =>
          vehicle.id ? [vehicle.id] : [],
        );
        for (const vehicle of vehicles) {
          const values = {
            plate: vehicle.plate,
            model: vehicle.model ?? null,
            year: vehicle.year ?? null,
            color: vehicle.color ?? null,
            active: true,
          };
          if (vehicle.id) {
            const existing =
              current.find((item) => item.id === vehicle.id) ??
              (await Vehicle.findOne({
                where: { id: vehicle.id, clientId: id },
                transaction,
              }));
            if (!existing) throw clientErrors.vehicleNotFound();
            await existing.update(values, { transaction });
          } else {
            await Vehicle.create({ ...values, clientId: id }, { transaction });
          }
        }
        const removedIds = current
          .filter((vehicle) => !incomingIds.includes(vehicle.id))
          .map((vehicle) => vehicle.id);
        if (removedIds.length) {
          await Vehicle.update(
            { active: false },
            { where: { id: removedIds }, transaction },
          );
        }
      }
    }),
  );

  return getById(id);
};

export const remove = async (id: number) => {
  await update(id, { active: false });
};

async function runClientTransaction<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapClientPersistenceError(error);
  }
}
