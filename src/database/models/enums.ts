export enum WorkOrderStatus {
  COTIZACION = "COTIZACION",
  PENDIENTE = "PENDIENTE",
  EN_PROCESO = "EN_PROCESO",
  TERMINADO = "TERMINADO",
  ENTREGADO = "ENTREGADO",
  CANCELADO = "CANCELADO",
}

export enum VehicleDeliveryType {
  CLIENTE_LLEVA = "CLIENTE_LLEVA",
  TALLER_RECOGE = "TALLER_RECOGE",
}

export enum VehicleStatus {
  EN_TALLER = "EN_TALLER",
  ENTREGADO = "ENTREGADO",
}

export enum WorkOrderServiceStatus {
  PENDIENTE = "PENDIENTE",
  EN_PROCESO = "EN_PROCESO",
  REALIZADO = "REALIZADO",
  CANCELADO = "CANCELADO",
}

export enum ProductOrigin {
  INVENTARIO = "INVENTARIO",
  COMPRA_EXTERNA = "COMPRA_EXTERNA",
}

export enum InventoryMovementType {
  ENTRADA = "ENTRADA",
  SALIDA = "SALIDA",
  AJUSTE = "AJUSTE",
}

export enum PaymentMethod {
  EFECTIVO = "EFECTIVO",
  QR = "QR",
  TRANSFERENCIA = "TRANSFERENCIA",
  TARJETA = "TARJETA",
  OTRO = "OTRO",
}
