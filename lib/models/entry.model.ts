import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';
import { EntryTypeSchema, EntryType } from './entry-type.model';
import { SupplierSchema, Supplier } from './supplier.model';



// Inventory Entry schema principal
export const EntrySchema = z.object({
  id: z.number(),
  reference: z.string().optional(),
  entry_type: EntryTypeSchema,
  supplier: SupplierSchema,
  entry_date: z.string(),
  notes: z.string(),
  total_amount: z.number(),
  tax_amount: z.number(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
}).merge(AuditFieldsSchema);


export const RetourEntry = z.object({
  id: z.number(),
  entry_type: z.number(),
  supplier: z.number(),
  entry_date: z.string(),
  notes: z.string(),
  total_amount: z.number(),
  tax_amount: z.number(),
  items: z.array(z.object({
    product: z.number(),
    quantity: z.number(),
    unit_price: z.number(),
    discount: z.number().optional(),
    total_amount: z.number(),
    tax_amount: z.number(),
  })).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
}).merge(AuditFieldsSchema);

// {
//   "id": 12,
//   "entry_type": 1,
//   "supplier": 1,
//   "entry_date": "2025-01-12T00:00:00Z",
//   "notes": "",
//   "total_amount": "0.00",
//   "tax_amount": "0.00",
//   "status": "PENDING",
//   "items": [],
//   "created_by": 1,
//   "updated_by": 1,
//   "created_at": "2025-09-03T13:09:07.856793Z",
//   "updated_at": "2025-09-03T13:09:07.856793Z"
// }

export type Entry = z.infer<typeof EntrySchema>;


// Create Inventory Entry schema (POST)
export const CreateEntrySchema = z.object({
  entry_type: z.number().nullable(),
  supplier: z.number().nullable(),
  entry_date: z.string().nullable(),
  notes: z.string().default(""),
  total_amount: z.number().nullable(),
  tax_amount: z.number().nullable(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  items: z.array(z.object({
    product: z.number(),
    quantity: z.number(),
    unit_price: z.number(),
    discount: z.number().optional(),
    total_amount: z.number(),
    tax_amount: z.number(),
  })).optional() ,
  created_at: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)).pipe(
    z.date().default(() => new Date())
  ).optional(),
  updated_at: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)).pipe(
    z.date().default(() => new Date())
  ).optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
})

export type CreateEntry = z.infer<typeof CreateEntrySchema>;

export { EntryType };
