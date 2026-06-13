import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

export const CustomerSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  full_name: z.string().optional(), // Peut être généré automatiquement
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  sales_count: z.number().int().nonnegative().default(0),
  total_purchases: z.number().min(0).default(0)
}).merge(AuditFieldsSchema);

export type Customer = z.infer<typeof CustomerSchema>;
