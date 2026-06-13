import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';

// Entry Type schema
export const EntryTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  usage_count: z.number(),
}).merge(AuditFieldsSchema);

export type EntryType = z.infer<typeof EntryTypeSchema>;


export const CreateEntryTypeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  code: z.string().min(1, "Le code est requis"),
  description: z.string(),
  is_active: z.boolean().default(true),
});

export const UpdateEntryTypeSchema = CreateEntryTypeSchema.partial();
export type CreateEntryType = z.infer<typeof CreateEntryTypeSchema>;
export type UpdateEntryType = z.infer<typeof UpdateEntryTypeSchema>;
