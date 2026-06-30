import { z } from 'zod';

const createSchema = z.object({

    tableId: z.string().min(1, 'Table ID is required'),
    items: z.array(
      z.object({
        itemId: z.string().min(1, 'Item ID is required'),
        menuItemId: z.string().optional(),
        name: z.string().min(1, 'Item name is required'),
        price: z.number().min(0, 'Price must be positive'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        modifiers: z.array(z.string()).optional().default([]),
      })
    ).min(1, 'At least one item is required'),
    totalPrice: z.number().min(0, 'Total price must be positive'),
    isVip: z.boolean().optional().default(false),
    subtotal: z.number().optional(),
    tax: z.number().optional(),

});

const updateSchema = z.object({

    status: z.enum(["PENDING", "SENT", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"]).optional(),
    paymentStatus: z.enum(["PENDING", "UNPAID", "PAID", "REFUNDED"]).optional(),
    items: z.array(
      z.object({
        itemId: z.string().optional(),
        name: z.string().optional(),
        price: z.number().optional(),
        quantity: z.number().optional(),
        modifiers: z.array(z.string()).optional(),
      })
    ).optional(),

});

export const orderValidation = {
  createSchema,
  updateSchema,
};