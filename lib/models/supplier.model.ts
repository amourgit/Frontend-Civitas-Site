import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

export const SupplierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Le nom du fournisseur est requis'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  entries_count: z.number().int().nonnegative().default(0),
  expenses_count: z.number().int().nonnegative().default(0)
}).merge(AuditFieldsSchema);

export type Supplier = z.infer<typeof SupplierSchema>;
