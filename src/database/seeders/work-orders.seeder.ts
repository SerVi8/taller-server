import type { Transaction } from "sequelize";
import {
  Product,
  StockMovement,
  Vehicle,
  WorkOrder,
  WorkOrderItem,
  WorkOrderService,
} from "../models/index.js";
import type { WorkOrderStatus } from "../models/work-order.model.js";

interface SeedOrderBlueprint {
  vehicleIndex: number;
  status: WorkOrderStatus;
  mileageIn: number;
  mileageOut: number | null;
  complaint: string;
  diagnosis: string | null;
  observations: string | null;
  recommendations: string | null;
  discount: number;
  daysAgoOpened: number;
  daysAgoCompleted?: number;
  services: Array<{
    title: string;
    description: string;
    price: number;
    complete: boolean;
  }>;
  items: Array<{
    productSku: string;
    quantity: number;
  }>;
}

const ORDERS_BLUEPRINT: SeedOrderBlueprint[] = [
  {
    vehicleIndex: 0, // 4521TKR - Toyota Hilux
    status: "completed",
    mileageIn: 78400,
    mileageOut: 78415,
    complaint:
      "Mantenimiento preventivo de 80.000 km y revisión de ruido al frenar.",
    diagnosis:
      "Aceite degradado por kilometraje y pastillas delanteras al 15% de vida útil.",
    observations:
      "Vehículo ingresó con llanta de auxilio en la tolva y nivel de combustible a 3/4.",
    recommendations:
      "Realizar rotación y balanceo de neumáticos en los próximos 5.000 km.",
    discount: 30,
    daysAgoOpened: 10,
    daysAgoCompleted: 9,
    services: [
      {
        title: "Cambio de aceite y filtro",
        description:
          "Drenado de aceite usado, reemplazo de filtro de aceite y llenado con aceite nuevo.",
        price: 60,
        complete: true,
      },
      {
        title: "Cambio de pastillas de freno delanteras",
        description:
          "Limpieza de mordazas, lubricación de pines guía e instalación de pastillas cerámicas.",
        price: 120,
        complete: true,
      },
    ],
    items: [
      { productSku: "LUB-15W40-4L", quantity: 2 },
      { productSku: "FIL-ACE-TOY01", quantity: 1 },
      { productSku: "FRE-PAST-DEL01", quantity: 1 },
    ],
  },
  {
    vehicleIndex: 2, // 5210LNB - Kia Sportage
    status: "completed",
    mileageIn: 34200,
    mileageOut: 34205,
    complaint: "Pérdida de potencia en subidas y tironeos al acelerar.",
    diagnosis:
      "Bujías con desgaste excesivo y filtro de aire obstruido por polvo.",
    observations: "Sin rayones visibles en carrocería.",
    recommendations: "Usar gasolina especial y revisar inyectores en 15.000 km.",
    discount: 0,
    daysAgoOpened: 6,
    daysAgoCompleted: 5,
    services: [
      {
        title: "Diagnóstico con escáner OBD-II",
        description: "Lectura de códigos de falla y prueba de sensores en vivo.",
        price: 100,
        complete: true,
      },
      {
        title: "Afinado de motor básico",
        description: "Reemplazo de 4 bujías de iridio y cambio de filtro de aire.",
        price: 110,
        complete: true,
      },
    ],
    items: [
      { productSku: "IGN-BUJ-IRID", quantity: 4 },
      { productSku: "FIL-AIR-UNIV02", quantity: 1 },
    ],
  },
  {
    vehicleIndex: 3, // 2845GHT - Nissan Frontier
    status: "in_progress",
    mileageIn: 112500,
    mileageOut: null,
    complaint:
      "Cambio de 2 llantas delanteras, alineación y cambio de refrigerante.",
    diagnosis:
      "Desgaste irregular en hombros de neumáticos delanteros por falta de alineación.",
    observations: "Cliente solicita conservar una de las llantas usadas como repuesto.",
    recommendations: "Verificar bujes de bandeja superior en el próximo servicio.",
    discount: 50,
    daysAgoOpened: 1,
    services: [
      {
        title: "Enllantaje y balanceo computarizado",
        description: "Montaje de 2 neumáticos R17 y balanceo con plomos adhesivos.",
        price: 80,
        complete: true,
      },
      {
        title: "Alineación 3D tren delantero",
        description: "Ajuste de convergencia, camber y caster.",
        price: 120,
        complete: false,
      },
      {
        title: "Limpieza de radiador y cambio de refrigerante",
        description: "Purga completa del circuito de refrigeración.",
        price: 70,
        complete: false,
      },
    ],
    items: [
      { productSku: "LLA-265-65R17", quantity: 2 },
      { productSku: "REF-COOL-50", quantity: 2 },
    ],
  },
  {
    vehicleIndex: 1, // 3190BPD - Suzuki Swift
    status: "open",
    mileageIn: 61800,
    mileageOut: null,
    complaint:
      "El vehículo tarda en dar arranque por las mañanas y toca cambio de aceite.",
    diagnosis: "Batería con caída de tensión a 9.4V durante el arranque.",
    observations: "Antena de radio corta, tapetes completos.",
    recommendations: null,
    discount: 0,
    daysAgoOpened: 0,
    services: [
      {
        title: "Servicio de cambio de aceite y revisión eléctrica",
        description: "Cambio de aceite 10W-40 y prueba de carga de alternador.",
        price: 70,
        complete: false,
      },
    ],
    items: [
      { productSku: "LUB-10W40-4L", quantity: 1 },
      { productSku: "BAT-12V-75AH", quantity: 1 },
    ],
  },
  {
    vehicleIndex: 5, // 1984DFG - Hyundai Tucson
    status: "price",
    mileageIn: 95000,
    mileageOut: null,
    complaint:
      "Cotización de mantenimiento general de frenos y cambio de fluidos.",
    diagnosis: "Se requiere purgado completo de líquido de frenos y pastillas.",
    observations: "Cotización válida por 7 días.",
    recommendations: "Programar cita con 1 día de anticipación.",
    discount: 20,
    daysAgoOpened: 2,
    services: [
      {
        title: "Mantenimiento completo del sistema de frenos",
        description:
          "Cambio de pastillas delanteras, regulación de frenos traseros y purgado DOT-4.",
        price: 160,
        complete: false,
      },
    ],
    items: [
      { productSku: "FRE-PAST-DEL01", quantity: 1 },
      { productSku: "FRE-LIQ-DOT4", quantity: 2 },
    ],
  },
  {
    vehicleIndex: 6, // 4890MNP - Mitsubishi L200
    status: "cancelled",
    mileageIn: 140300,
    mileageOut: null,
    complaint: "Revisión de embrague y cambio de aceite de motor.",
    diagnosis: "Desgaste en kit de embrague.",
    observations:
      "Ingresó en grúa.\n[Cancelada]: El cliente decidió postergar la reparación por viaje.",
    recommendations: "No circular largas distancias hasta reemplazar el embrague.",
    discount: 0,
    daysAgoOpened: 4,
    services: [
      {
        title: "Desmontaje de caja para inspección de embrague",
        description: "Inspección inicial",
        price: 150,
        complete: false,
      },
    ],
    items: [{ productSku: "LUB-15W40-4L", quantity: 2 }],
  },
];

export const seedWorkOrders = async (
  vehicles: Vehicle[],
  products: Product[],
  transaction: Transaction,
): Promise<WorkOrder[]> => {
  const existingCount = await WorkOrder.count({ transaction });
  if (existingCount > 0) {
    console.log("ℹ️  Órdenes de trabajo ya existen, omitiendo seeder.");
    return WorkOrder.findAll({ order: [["id", "ASC"]], transaction });
  }

  const productBySku = new Map(products.map((p) => [p.sku, p]));
  const createdOrders: WorkOrder[] = [];

  for (const blueprint of ORDERS_BLUEPRINT) {
    const vehicle = vehicles[blueprint.vehicleIndex] ?? vehicles[0];
    if (!vehicle) continue;

    const openedAt = daysAgo(blueprint.daysAgoOpened);
    const completedAt =
      blueprint.daysAgoCompleted !== undefined
        ? daysAgo(blueprint.daysAgoCompleted)
        : null;

    const order = await WorkOrder.create(
      {
        code: `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        vehicleId: vehicle.id,
        clientId: vehicle.clientId,
        status: blueprint.status,
        mileageIn: blueprint.mileageIn,
        mileageOut: blueprint.mileageOut,
        complaint: blueprint.complaint,
        diagnosis: blueprint.diagnosis,
        observations: blueprint.observations,
        recommendations: blueprint.recommendations,
        discount: blueprint.discount,
        total: 0,
        openedAt,
        completedAt,
      },
      { transaction },
    );

    const code = `OT-${String(order.id).padStart(6, "0")}`;

    let servicesSubtotal = 0;
    for (const srv of blueprint.services) {
      servicesSubtotal += srv.price;
      await WorkOrderService.create(
        {
          workOrderId: order.id,
          title: srv.title,
          description: srv.description,
          price: srv.price,
          complete: srv.complete,
        },
        { transaction },
      );
    }

    let itemsSubtotal = 0;
    for (const item of blueprint.items) {
      const product = productBySku.get(item.productSku);
      if (!product) continue;

      const unitCost = Number(product.costPrice);
      const unitPrice = Number(product.salePrice);
      itemsSubtotal += item.quantity * unitPrice;

      await WorkOrderItem.create(
        {
          workOrderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          unitCost,
          unitPrice,
        },
        { transaction },
      );

      // Movimiento de salida por la orden
      await StockMovement.create(
        {
          productId: product.id,
          quantity: String(-item.quantity),
          reason: "work_order",
          workOrderId: order.id,
          unitCost: String(unitCost),
          notes: `Orden ${code}`,
        },
        { transaction },
      );

      // Si la orden está cancelada, registramos también la devolución al stock
      if (blueprint.status === "cancelled") {
        await StockMovement.create(
          {
            productId: product.id,
            quantity: String(item.quantity),
            reason: "return",
            workOrderId: order.id,
            unitCost: String(unitCost),
            notes: `Cancelación ${code}: El cliente decidió postergar la reparación por viaje.`,
          },
          { transaction },
        );
      } else {
        const newStock = Math.max(0, Number(product.stock) - item.quantity);
        await product.update({ stock: newStock }, { transaction });
      }
    }

    const subtotal = servicesSubtotal + itemsSubtotal;
    const total = Math.max(0, Number((subtotal - blueprint.discount).toFixed(2)));

    await order.update({ code, total }, { transaction });
    createdOrders.push(order);
  }

  console.log(
    `✅ ${createdOrders.length} órdenes de trabajo (con servicios, ítems y movimientos de stock) creadas.`,
  );
  return createdOrders;
};

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
