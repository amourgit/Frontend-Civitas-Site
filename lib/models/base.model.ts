import { z } from 'zod';
import { UserReferenceSchema } from './user-reference.model';

/**
 * Schéma de base pour les métadonnées d'audit
 * Peut être étendu par d'autres schémas pour inclure automatiquement ces champs
 */
export const AuditFieldsSchema = z.object({
  created_at: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)).pipe(
    z.date().default(() => new Date())
  ).optional(),
  updated_at: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)).pipe(
    z.date().default(() => new Date())
  ).optional(),
  created_by: UserReferenceSchema.optional(),
  updated_by: UserReferenceSchema.optional(),
});

export type AuditFields = z.infer<typeof AuditFieldsSchema>;



