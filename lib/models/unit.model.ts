import { z } from 'zod';
import { AuditFieldsSchema } from './base.model';


// Schéma principal pour Currency
export const UnitSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Le nom de la devise est requis'),
  abbreviation: z.string().min(1, 'L\'abréviation est requise').max(10, 'L\'abréviation ne peut pas dépasser 10 caractères'),
  is_active: z.boolean().default(true),
  usage_count: z.number().int().nonnegative().default(0),
}).merge(AuditFieldsSchema);

export type Unit = z.infer<typeof UnitSchema>;

// Schémas dérivés pour les opérations CRUD
export const CreateUnitSchema = UnitSchema.omit({ 
  id: true, 
  usage_count: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true
});

export type CreateUnit = z.infer<typeof CreateUnitSchema>;
export const UpdateUnitSchema = CreateUnitSchema.partial();
export type UpdateUnit = z.infer<typeof UpdateUnitSchema>;

