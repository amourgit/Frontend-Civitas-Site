import { z } from 'zod';

// Schéma pour l'utilisateur
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional().nullable(),
});

type User = z.infer<typeof UserSchema>;

// Schéma pour le créneau horaire
const TimeSlotSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  created_by: UserSchema.optional(),
  updated_by: UserSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});



type TimeSlot = z.infer<typeof TimeSlotSchema>;

// Schéma pour la relation utilisateur-créneau horaire
const UserTimeSlotSchema = z.object({
  id: z.number(),
  user: UserSchema.optional(),
  time_slot: TimeSlotSchema,
  is_active: z.boolean(),
  description: z.string(),
  created_by: UserSchema.optional(),
  updated_by: UserSchema.optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

type UserTimeSlot = z.infer<typeof UserTimeSlotSchema>;

export type { User, TimeSlot, UserTimeSlot };
export { UserSchema, TimeSlotSchema, UserTimeSlotSchema };
