import type { Transaction } from "sequelize";
import { Product, StockMovement } from "../models/index.js";

const PRODUCTS_DATA = [
  {
    sku: "LUB-10W40-4L",
    name: "Aceite Sintético 10W-40 Galón 4L",
    description: "Aceite multigrado sintético para motores a gasolina y GLP",
    unit: "galón",
    costPrice: 185,
    salePrice: 250,
    initialStock: 24,
    minStock: 5,
  },
  {
    sku: "LUB-15W40-4L",
    name: "Aceite Mineral 15W-40 Diésel 4L",
    description: "Aceite para motores diésel pesados y camionetas",
    unit: "galón",
    costPrice: 150,
    salePrice: 210,
    initialStock: 18,
    minStock: 4,
  },
  {
    sku: "FIL-ACE-TOY01",
    name: "Filtro de Aceite Toyota Hilux / Corolla",
    description: "Filtro de aceite original compatible con motores 1GR y 2TR",
    unit: "unidad",
    costPrice: 38,
    salePrice: 65,
    initialStock: 30,
    minStock: 6,
  },
  {
    sku: "FIL-AIR-UNIV02",
    name: "Filtro de Aire de Motor Estándar",
    description: "Filtro de aire de alta eficiencia para sedanes y SUVs",
    unit: "unidad",
    costPrice: 45,
    salePrice: 80,
    initialStock: 20,
    minStock: 5,
  },
  {
    sku: "FRE-PAST-DEL01",
    name: "Juego Pastillas de Freno Delanteras Cerámicas",
    description: "Juego de 4 pastillas delanteras bajo ruido",
    unit: "juego",
    costPrice: 140,
    salePrice: 220,
    initialStock: 12,
    minStock: 3,
  },
  {
    sku: "FRE-LIQ-DOT4",
    name: "Líquido de Frenos DOT-4 500ml",
    description: "Fluido sintético de alto punto de ebullición DOT-4",
    unit: "frasco",
    costPrice: 28,
    salePrice: 45,
    initialStock: 25,
    minStock: 5,
  },
  {
    sku: "REF-COOL-50",
    name: "Refrigerante / Anticongelante Rojo 50/50 4L",
    description: "Refrigerante de larga duración pre-diluido",
    unit: "galón",
    costPrice: 75,
    salePrice: 120,
    initialStock: 15,
    minStock: 4,
  },
  {
    sku: "IGN-BUJ-IRID",
    name: "Bujía de Encendido Punta Iridio",
    description: "Bujía de alto rendimiento y larga vida útil",
    unit: "unidad",
    costPrice: 42,
    salePrice: 70,
    initialStock: 40,
    minStock: 8,
  },
  {
    sku: "LLA-265-65R17",
    name: "Llanta Todo Terreno 265/65 R17 A/T",
    description: "Neumático radial para camioneta 4x4",
    unit: "unidad",
    costPrice: 820,
    salePrice: 1050,
    initialStock: 8,
    minStock: 4,
  },
  {
    sku: "BAT-12V-75AH",
    name: "Batería Libre Mantenimiento 12V 75Ah",
    description: "Batería de arranque de alta capacidad",
    unit: "unidad",
    costPrice: 540,
    salePrice: 720,
    initialStock: 6,
    minStock: 2,
  },
];

export const seedProducts = async (
  transaction?: Transaction,
): Promise<Product[]> => {
  const existingCount = await Product.count({
    ...(transaction && { transaction }),
  });

  if (existingCount > 0) {
    console.log("ℹ️  Productos ya existen, omitiendo seeder.");
    return Product.findAll({
      order: [["id", "ASC"]],
      ...(transaction && { transaction }),
    });
  }

  const createdProducts: Product[] = [];

  for (const item of PRODUCTS_DATA) {
    const product = await Product.create(
      {
        sku: item.sku,
        name: item.name,
        description: item.description,
        unit: item.unit,
        costPrice: item.costPrice,
        salePrice: item.salePrice,
        stock: item.initialStock,
        minStock: item.minStock,
        active: true,
      },
      { ...(transaction && { transaction }) },
    );

    await StockMovement.create(
      {
        productId: product.id,
        quantity: String(item.initialStock),
        reason: "purchase",
        workOrderId: null,
        unitCost: String(item.costPrice),
        notes: "Compra inicial de inventario (Seeder)",
      },
      { ...(transaction && { transaction }) },
    );

    createdProducts.push(product);
  }

  console.log(
    `✅ ${createdProducts.length} productos e ingresos de stock inicial creados.`,
  );
  return createdProducts;
};
