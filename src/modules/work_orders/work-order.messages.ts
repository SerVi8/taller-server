export const workOrderMessages = {
  notFound: "Orden de trabajo no encontrada.",
  serviceNotFound: "Servicio no encontrado en esta orden de trabajo.",
  itemNotFound: "Ítem no encontrado en esta orden de trabajo.",
  itemAlreadyExists:
    "El producto ya está registrado en esta orden; edita la cantidad de la línea existente.",
  vehicleNotFound: "Vehículo no encontrado o no disponible.",
  openOrderConflict: (code: string) =>
    `El vehículo ya tiene la orden ${code} abierta.`,
  invalidMileageIn: (lastMileage: number) =>
    `El kilometraje no puede ser menor al último registrado (${lastMileage} km).`,
  invalidMileageOut: (mileageIn: number) =>
    `El kilometraje de salida no puede ser menor al de ingreso (${mileageIn} km).`,
  invalidDiscount: "El descuento no puede ser mayor al subtotal de la orden.",
  orderNotEditable:
    "No se puede modificar una orden de trabajo completada o cancelada.",
  cannotStartOrder:
    "Solo se puede poner en progreso una orden en estado abierta o cotización.",
  cannotCompleteOrder:
    "Solo se puede completar una orden que esté abierta o en progreso.",
  cannotCancelOrder:
    "No se puede cancelar una orden que ya fue completada o cancelada.",
  duplicateCode: "Ya existe una orden de trabajo con ese código.",
  validation: {
    vehicleRequired: "El vehículo es obligatorio.",
    mileageInInvalid: "El kilometraje de ingreso debe ser mayor o igual a 0.",
    mileageOutInvalid: "El kilometraje de salida es obligatorio y debe ser mayor o igual a 0.",
    complaintRequired: "El motivo de ingreso o falla reportada es obligatorio.",
    cancelReasonRequired: "El motivo de cancelación es obligatorio.",
    discountPositive: "El descuento no puede ser negativo.",
    serviceDescriptionRequired: "La descripción del servicio es obligatoria.",
    servicePricePositive: "El precio del servicio no puede ser negativo.",
    itemQuantityPositive: "La cantidad del producto debe ser mayor a 0.",
    itemPricePositive: "El precio unitario no puede ser negativo.",
    productDuplicate:
      "Hay productos repetidos; une las cantidades en una sola línea.",
    invalidDateRange: "La fecha inicial no puede ser posterior a la final.",
  },
} as const;
