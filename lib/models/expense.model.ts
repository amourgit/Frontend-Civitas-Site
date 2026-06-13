import { z } from 'zod';


// ================================
// SCHEMAS DE BASE UTILISATEUR
// ================================

const BaseUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
});

// ================================
// SCHEMAS POUR LES CATÉGORIES DE DÉPENSES
// ================================

export const ExpenseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  usage_count: z.number(),
  created_by: BaseUserSchema,
  updated_by: BaseUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schéma pour la création d'une catégorie de dépense
export const CreateExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis'),
  description: z.string().default(''),
  is_active: z.boolean().default(true),
  created_by: z.number()
});

// Schéma pour la mise à jour d'une catégorie de dépense
export const UpdateExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  code: z.string().min(1, 'Le code est requis').optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  updated_by: z.number()
}).partial();

// ================================
// SCHEMAS POUR LES STATUTS DE DÉPENSES
// ================================

export const ExpenseStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  usage_count: z.number(),
  created_by: BaseUserSchema,
  updated_by: BaseUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schéma pour la création d'un statut de dépense
export const CreateExpenseStatusSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis'),
  description: z.string().default(''),
  is_active: z.boolean().default(true),
  created_by: z.number()
});

// Schéma pour la mise à jour d'un statut de dépense
export const UpdateExpenseStatusSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  code: z.string().min(1, 'Le code est requis').optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  updated_by: z.number()
}).partial();


// ================================
// SCHEMAS POUR LES DÉPENSES
// ================================

export const ServerExpenseSchema = z.object({
  id: z.number(),
  reference: z.string(),
  description: z.string(),
  category: ExpenseCategorySchema.nullable(),
  amount: z.string(), // Les montants viennent souvent comme strings de l'API
  tax_amount: z.string(),
  total_amount: z.string(),
  expense_date: z.string(),
  due_date: z.string().nullable(),
  payment_date: z.string().nullable(),
  payment_method: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string(),
    is_active: z.boolean(),
    usage_count: z.number(),
    created_by: BaseUserSchema,
    updated_by: BaseUserSchema.nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }).nullable(),
  status: ExpenseStatusSchema,
  receipt_url: z.string().nullable(),
  notes: z.string(),
  is_recurring: z.boolean(),
  recurring_interval: z.string().nullable(),
  next_occurrence: z.string().nullable(),
  created_by: BaseUserSchema,
  updated_by: BaseUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateExpenseSchema = z.object({
  description: z.string().default(''),
  category_id: z.number().nullable().default(null),
  amount: z.number().nullable().default(null),
  tax_amount: z.number().nullable().default(null),
  expense_date: z.string().nullable().default(null),
  due_date: z.string().nullable().default(null),
  payment_date: z.string().nullable().default(null),
  payment_method_id: z.number().nullable().default(null),
  status_id: z.number().nullable().default(null),
  receipt_url: z.string().default(''),
  notes: z.string().default(''),
  recurring_expense_id: z.number().nullable().default(null),
  created_by_id: z.number().nullable().default(null),
  updated_by_id: z.number().nullable().default(null),
});

export const UpdateExpenseSchema = z.object({
  description: z.string().optional(),
  category_id: z.number().nullable().optional(),
  amount: z.number().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  expense_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  payment_date: z.string().nullable().optional(),
  payment_method_id: z.number().nullable().optional(),
  status_id: z.number().nullable().optional(),
  receipt_url: z.string().optional(),
  notes: z.string().optional(),
  recurring_expense_id: z.number().nullable().optional(),
  updated_by_id: z.number().nullable().optional(),
}).partial();


// ================================
// SCHEMAS POUR LES DÉPENSES RÉCURRENTES
// ================================

export const ServerRecurringExpenseSchema = z.object({
  id: z.number(),
  reference: z.string(),
  description: z.string(),
  category: ExpenseCategorySchema.nullable(),
  amount: z.string(),
  tax_amount: z.string(),
  total_amount: z.string(),
  interval: z.string(),
  next_occurrence: z.string(),
  last_generated: z.string().nullable(),
  is_active: z.boolean(),
  payment_method: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    description: z.string(),
    is_active: z.boolean(),
    usage_count: z.number(),
    created_by: BaseUserSchema,
    updated_by: BaseUserSchema.nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }).nullable(),
  notes: z.string(),
  created_by: BaseUserSchema,
  updated_by: BaseUserSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateRecurringExpenseSchema = z.object({
  reference: z.string().default(''),
  description: z.string().min(1, 'La description est requise'),
  category: z.number().nullable(),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  tax_amount: z.number().min(0, 'Le montant de la taxe doit être positif').default(0),
  total_amount: z.number().min(0.01, 'Le montant total doit être positif'),
  interval: z.string(),
  next_occurrence: z.string(),
  is_active: z.boolean().default(true),
  payment_method: z.number().nullable(),
  notes: z.string().default(''),
  created_by: z.number(),
});

export const UpdateRecurringExpenseSchema = z.object({
  reference: z.string().optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  category: z.number().nullable().optional(),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0').optional(),
  tax_amount: z.number().min(0, 'Le montant de la taxe doit être positif').optional(),
  total_amount: z.number().min(0.01, 'Le montant total doit être positif').optional(),
  interval: z.string().optional(),
  next_occurrence: z.string().optional(),
  is_active: z.boolean().optional(),
  payment_method: z.number().nullable().optional(),
  notes: z.string().optional(),
  updated_by: z.number().optional(),
}).partial();

// ================================
// TYPES INFÉRÉS
// ================================

export type ServerExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type CreateExpenseCategoryData = z.infer<typeof CreateExpenseCategorySchema>;
export type UpdateExpenseCategoryData = Partial<CreateExpenseCategoryData>;

export type ServerExpenseStatus = z.infer<typeof ExpenseStatusSchema>;
export type CreateExpenseStatusData = z.infer<typeof CreateExpenseStatusSchema>;
export type UpdateExpenseStatusData = Partial<CreateExpenseStatusData>;

export type ServerExpense = z.infer<typeof ServerExpenseSchema>;
export type CreateExpenseData = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseData = Partial<CreateExpenseData>;

export type ServerRecurringExpense = z.infer<typeof ServerRecurringExpenseSchema>;
export type CreateRecurringExpenseData = z.infer<typeof CreateRecurringExpenseSchema>;
export type UpdateRecurringExpenseData = Partial<CreateRecurringExpenseData>;



// ================================
// FONCTIONS UTILITAIRES
// ================================

export const formatAmount = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
  }).format(num);
};

export const parseAmount = (amount: string): number => {
  return parseFloat(amount) || 0;
};

export const calculateTotalAmount = (amount: number, taxAmount: number = 0): number => {
  return amount + taxAmount;
};

export const isExpenseOverdue = (expense: ServerExpense): boolean => {
  if (!expense.due_date || expense.status.code === 'PAID') {
    return false;
  }
  
  const dueDate = new Date(expense.due_date);
  const today = new Date();
  return dueDate < today;
};
