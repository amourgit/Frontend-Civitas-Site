import { z } from 'zod';

// Schéma pour le rôle utilisateur
const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().optional()
});

type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  role: RoleSchema,
  is_active: z.boolean().default(true),
  lastLogin: z.date().optional(),
  lastActivity: z.date().optional(),
  avatarUrl: z.string().url().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  permissions: z.array(z.string()).default([]), // Permissions spécifiques supplémentaires
  mustChangePassword: z.boolean().default(true),
  loginAttempts: z.number().default(0),
  lockUntil: z.date().optional(),
  resetPasswordToken: z.string().optional(),
  resetPasswordExpires: z.date().optional(),
  emailVerified: z.boolean().default(false),
  verificationToken: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional(),
});

export type User = z.infer<typeof UserSchema> & {
  status?: string;  // Pour la rétrocompatibilité
  role: Role;
  is_active: boolean;
};

export type { Role };
