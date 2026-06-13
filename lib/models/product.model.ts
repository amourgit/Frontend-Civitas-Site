import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';
import { UnitSchema } from './unit.model';
// import { ProductCategorySchema } from './product-category.model';


export const ProductSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  category: z.string(),
  unit: UnitSchema,
  purchasePrice: z.number().min(0, 'Le prix d\'achat doit être positif'),
  sellingPrice: z.number().min(0, 'Le prix de vente doit être positif'),
  currentStock: z.number().min(0).default(0),
  alertThreshold: z.number().min(0).default(5),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
}).merge(AuditFieldsSchema);

export type Product = z.infer<typeof ProductSchema>;
