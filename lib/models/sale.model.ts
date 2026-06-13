import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';
import { PaymentMethodSchema } from './payment-method.model';
import { PaymentStatusSchema } from './payment-status.model';
import { SaleStatusSchema } from './sale-status.model';
import { CustomerSchema } from './customer.model';


export const SaleItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().positive('La quantité doit être positive'),
  discount: z.number().min(0).default(0), // Remise appliquée
  taxRate: z.number().min(0).max(100).default(0), // Taux de TVA en %
  totalPrice: z.number().min(0, 'Le prix total doit être positif'),
});

export const SaleSchema = z.object({
  id: z.string().uuid(),
  reference: z.string(), // Numéro de ticket/facture
  customerId: CustomerSchema, // Pour les clients enregistrés
  items: z.array(SaleItemSchema).min(1, 'Au moins un article est requis'),
  saleDate: z.date(),
  subtotal: z.number().min(0, 'Le sous-total doit être positif'),
  discountAmount: z.number().min(0).default(0), // Remise globale
  taxAmount: z.number().min(0, 'Le montant de la taxe doit être positif').default(0),
  totalAmount: z.number().min(0, 'Le montant total doit être positif'),
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  status: SaleStatusSchema,
  notes: z.string().optional(),
  tableNumber: z.string().optional(), // Pour la restauration sur place
  isTakeAway: z.boolean().default(false),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
}).merge(AuditFieldsSchema);

export type Sale = z.infer<typeof SaleSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
export type SaleStatus = z.infer<typeof SaleStatusSchema>;
