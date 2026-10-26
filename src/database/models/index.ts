import { User } from "./user.model.js";
import { Client } from "./client.model.js";
import { Vehicle } from "./vehicle.model.js";
import { Product } from "./product.model.js";
import { WorkOrder } from "./work-order.model.js";
import { WorkOrderService } from "./work-order-service.model.js";
import { WorkOrderItem } from "./work-order-item.model.js";
import { StockMovement } from "./stock-movement.model.js";

// Cliente → Vehículos
Client.hasMany(Vehicle, {
  foreignKey: "clientId",
  as: "vehicles",
  onDelete: "RESTRICT",
});
Vehicle.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Vehículo / Cliente / Mecánico → Órdenes
Vehicle.hasMany(WorkOrder, {
  foreignKey: "vehicleId",
  as: "workOrders",
  onDelete: "RESTRICT",
});
WorkOrder.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

Client.hasMany(WorkOrder, {
  foreignKey: "clientId",
  as: "workOrders",
  onDelete: "RESTRICT",
});
WorkOrder.belongsTo(Client, { foreignKey: "clientId", as: "client" });

User.hasMany(WorkOrder, {
  foreignKey: "mechanicId",
  as: "workOrders",
  onDelete: "SET NULL",
});
WorkOrder.belongsTo(User, { foreignKey: "mechanicId", as: "mechanic" });

// Orden → Servicios y Productos usados
WorkOrder.hasMany(WorkOrderService, {
  foreignKey: "workOrderId",
  as: "services",
  onDelete: "CASCADE",
});
WorkOrderService.belongsTo(WorkOrder, {
  foreignKey: "workOrderId",
  as: "workOrder",
});

WorkOrder.hasMany(WorkOrderItem, {
  foreignKey: "workOrderId",
  as: "items",
  onDelete: "CASCADE",
});
WorkOrderItem.belongsTo(WorkOrder, {
  foreignKey: "workOrderId",
  as: "workOrder",
});

Product.hasMany(WorkOrderItem, {
  foreignKey: "productId",
  as: "usages",
  onDelete: "RESTRICT",
});
WorkOrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Stock
Product.hasMany(StockMovement, {
  foreignKey: "productId",
  as: "movements",
  onDelete: "RESTRICT",
});
StockMovement.belongsTo(Product, { foreignKey: "productId", as: "product" });

WorkOrder.hasMany(StockMovement, {
  foreignKey: "workOrderId",
  as: "stockMovements",
  onDelete: "SET NULL",
});
StockMovement.belongsTo(WorkOrder, {
  foreignKey: "workOrderId",
  as: "workOrder",
});

/* User.hasMany(StockMovement, {
  foreignKey: "userId",
  as: "stockMovements",
  onDelete: "RESTRICT",
});
StockMovement.belongsTo(User, { foreignKey: "userId", as: "user" }); */

export {
  User,
  Client,
  Vehicle,
  Product,
  WorkOrder,
  WorkOrderService,
  WorkOrderItem,
  StockMovement,
};
