import { z } from 'zod';

export const UserReferenceSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
});

export type UserReference = z.infer<typeof UserReferenceSchema>;
