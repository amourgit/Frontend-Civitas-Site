import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

export const PaymentMethodSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  usage_count: z.number().int().nonnegative().default(0),
}).merge(AuditFieldsSchema);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
