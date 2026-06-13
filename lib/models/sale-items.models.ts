import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';
import { ProductSchema } from './product.model';
import { SaleSchema } from './sale.model';

// Sale Item schema principal
export const SaleItemSchema = z.object({
  id: z.number(),
  sale: SaleSchema.optional(),
  product: ProductSchema,
  quantity: z.string(),
  discount: z.string(),
  tax_rate: z.string(),
  total_price: z.string().optional(),
}).merge(AuditFieldsSchema);

export type SaleItem = z.infer<typeof SaleItemSchema>;