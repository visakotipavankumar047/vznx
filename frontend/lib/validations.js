import { z } from 'zod';

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  price: z.number().min(0, 'Price must be positive').or(z.string().transform(Number)),
  quantity: z.number().min(0, 'Quantity must be positive').or(z.string().transform(Number)),
});
