import type { Transaction } from "sequelize";
import { Client, Vehicle } from "../models/index.js";

export interface SeededClientsResult {
  clients: Client[];
  vehicles: Vehicle[];
}

const CLIENTS_DATA = [
  {
    name: "Juan Carlos Mamani",
    phone: "71234567",
    email: "jc.mamani@gmail.com",
    active: true,
    vehicles: [
      {
        plate: "4521TKR",
        model: "Toyota Hilux 2.7",
        year: 2020,
        color: "Blanco",
      },
      {
        plate: "3190BPD",
        model: "Suzuki Swift 1.4",
        year: 2018,
        color: "Rojo",
      },
    ],
  },
  {
    name: "María Fernanda Rojas",
    phone: "76543210",
    email: "mfernanda.rojas@hotmail.com",
    active: true,
    vehicles: [
      {
        plate: "5210LNB",
        model: "Kia Sportage 2.0",
        year: 2022,
        color: "Gris Plata",
      },
    ],
  },
  {
    name: "Roberto Siles Camacho",
    phone: "70112233",
    email: "roberto.siles@empresa.bo",
    active: true,
    vehicles: [
      {
        plate: "2845GHT",
        model: "Nissan Frontier NP300",
        year: 2019,
        color: "Negro",
      },
      {
        plate: "6012KLP",
        model: "Toyota Corolla 1.8",
        year: 2021,
        color: "Azul",
      },
    ],
  },
  {
    name: "Patricia Guzmán Flores",
    phone: "68901234",
    email: "patricia.guzman@gmail.com",
    active: true,
    vehicles: [
      {
        plate: "1984DFG",
        model: "Hyundai Tucson 2.0",
        year: 2017,
        color: "Blanco Perla",
      },
    ],
  },
  {
    name: "Jorge Luis Torrez",
    phone: "72456789",
    email: "jorge.torrez@yahoo.com",
    active: true,
    vehicles: [
      {
        plate: "4890MNP",
        model: "Mitsubishi L200 Triton",
        year: 2021,
        color: "Gris Oscuro",
      },
    ],
  },
  {
    name: "Transportes Andinos S.R.L.",
    phone: "77889900",
    email: "logistica@transportesandinos.bo",
    active: true,
    vehicles: [
      {
        plate: "3712RTY",
        model: "Volkswagen Gol 1.6",
        year: 2016,
        color: "Plata",
      },
    ],
  },
];

export const seedClientsAndVehicles = async (
  transaction?: Transaction,
): Promise<SeededClientsResult> => {
  const existingCount = await Client.count({
    ...(transaction && { transaction }),
  });

  if (existingCount > 0) {
    const [clients, vehicles] = await Promise.all([
      Client.findAll({
        order: [["id", "ASC"]],
        ...(transaction && { transaction }),
      }),
      Vehicle.findAll({
        order: [["id", "ASC"]],
        ...(transaction && { transaction }),
      }),
    ]);
    console.log("ℹ️  Clientes y vehículos ya existen, omitiendo seeder.");
    return { clients, vehicles };
  }

  const createdClients: Client[] = [];
  const createdVehicles: Vehicle[] = [];

  for (const item of CLIENTS_DATA) {
    const client = await Client.create(
      {
        name: item.name,
        phone: item.phone,
        email: item.email,
        active: item.active,
      },
      { ...(transaction && { transaction }) },
    );
    createdClients.push(client);

    for (const v of item.vehicles) {
      const vehicle = await Vehicle.create(
        {
          clientId: client.id,
          plate: v.plate,
          model: v.model,
          year: v.year,
          color: v.color,
          active: true,
        },
        { ...(transaction && { transaction }) },
      );
      createdVehicles.push(vehicle);
    }
  }

  console.log(
    `✅ ${createdClients.length} clientes y ${createdVehicles.length} vehículos creados.`,
  );
  return { clients: createdClients, vehicles: createdVehicles };
};
