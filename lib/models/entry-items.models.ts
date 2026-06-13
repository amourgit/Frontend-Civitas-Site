import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';
import { ProductSchema } from './product.model';
import { EntrySchema } from './entry.model';

// Inventory Entry schema principal
export const EntryItemSchema = z.object({
  id: z.number(),
  entry: EntrySchema.optional(),
  product: ProductSchema,
  quantity: z.string(),
  total_price: z.string(),
  expiry_date: z.string().nullable(),
  batch_number: z.string(),
}).merge(AuditFieldsSchema);

export type EntryItem = z.infer<typeof EntryItemSchema>;

// Create Inventory Entry schema (POST)
export const CreateEntryItemSchema = z.object({
  entry_id: z.number().optional(),
  product_id: z.number().optional(),
  quantity: z.number().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  batch_number: z.string().default(""),
  created_by: z.number().optional(),
});


export type CreateEntryItem = z.infer<typeof CreateEntryItemSchema>;
