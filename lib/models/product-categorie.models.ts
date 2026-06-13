import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

// Schéma pour les catégories
export const CategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Le nom de la catégorie est requis'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  product_count: z.number().int().nonnegative().default(0),
}).merge(AuditFieldsSchema);

export type Category = z.infer<typeof CategorySchema>;