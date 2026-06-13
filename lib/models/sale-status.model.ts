import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

export const SaleStatusSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  usage_count: z.number().int().nonnegative().default(0)
}).merge(AuditFieldsSchema);

export type SaleStatus = z.infer<typeof SaleStatusSchema>;
