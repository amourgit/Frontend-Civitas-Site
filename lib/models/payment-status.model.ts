import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

export const PaymentStatusSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  is_terminal: z.boolean().default(false),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur hexadécimale invalide').optional(),
}).merge(AuditFieldsSchema);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
