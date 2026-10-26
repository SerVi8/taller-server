import { Product } from "../../database/models/product.model.js";

export const inventoryMessages = {
  product: {
    notFound: "Producto no encontrado.",
    duplicateSku: (sku?: string) =>
      sku
        ? `El Codigo/SKU ${sku.toUpperCase()} ya está registrada.`
        : "El Codigo/SKU ya está registrada.",
    noStock: (product: Product) =>
      `Stock insuficiente de "${product.name}" (disponible: ${product.stock} ${product.unit})`,
    validation: {
      skuRequired: "El codigo es obligatorio.",
      nameRequired: "El nombre es obligatorio.",
      unitRequired: "La unidad de medida es obligatoria.",
    },
  },
  movent: {
    validation: {
      positive: "La cantidad debe ser mayor a 0",
      costPositive: "El costo no puede ser negativo",
      productRequired: "Agrega al menos un producto",
      productDuplicate:
        "Hay productos repetidos; une las cantidades en una sola línea",
    },
  },
} as const;
