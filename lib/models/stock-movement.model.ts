import { z } from 'zod';

export const MovementType = z.enum([
  'PURCHASE',     // Achat fournisseur
  'SALE',         // Vente
  'RETURN',       // Retour client
  'WASTE',        // Perte/gaspillage
  'ADJUSTMENT',   // Ajustement manuel
  'TRANSFER_IN',  // Transfert entrant
  'TRANSFER_OUT', // Transfert sortant
  'DONATION',     // Don
  'EXPIRE',       // Péremption
  'OTHER'         // Autre type de mouvement
]);

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  movementType: MovementType,
  quantity: z.number().refine(q => q !== 0, {
    message: 'La quantité ne peut pas être zéro',
  }),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
  totalValue: z.number(),
  referenceId: z.string().uuid().optional(), // ID de la vente/entrée liée
  referenceType: z.enum(['SALE', 'ENTRY', 'ADJUSTMENT', 'TRANSFER']).optional(),
  fromLocationId: z.string().uuid().optional(), // Pour les transferts
  toLocationId: z.string().uuid().optional(),   // Pour les transferts
  notes: z.string().optional(),
  movementDate: z.date(),
  createdAt: z.date(),
  createdBy: z.string().uuid(),
  
  // Champs calculés pour les requêtes
  productName: z.string().optional(),
  productUnit: z.string().optional(),
  userName: z.string().optional(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;
export type MovementType = z.infer<typeof MovementType>;
