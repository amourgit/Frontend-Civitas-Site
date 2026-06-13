// Réexportation de tous les modèles
export * from './product.model';
export * from './entry.model';
export * from './sale.model';
export * from './sale-status.model';
export * from './stock-movement.model';
export * from './expense.model';
export * from './user.model';
export * from './payment-method.model';
export * from './payment-status.model';
export * from './customer.model';
export * from './supplier.model';

// Réexportation des types
export type { User, Role } from './user.model';
export type { PaymentMethod } from './payment-method.model';
export type { PaymentStatus } from './payment-status.model';
export type { Customer } from './customer.model';
export type { Supplier } from './supplier.model';
export type { SaleStatus } from './sale-status.model';
