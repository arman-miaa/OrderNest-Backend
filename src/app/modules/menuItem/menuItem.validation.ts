import { z } from 'zod';

const createSchema = z.object({

    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().default(""),
    price: z.number().min(0, 'Price must be a positive number'),  // ✅ Add price
    category: z.string().optional().default("Starter"),           // ✅ Add category
    prepTime: z.number().optional(),                               // ✅ Optional - strip later
    inStock: z.boolean().optional().default(true),                 // ✅ Add stock
 
});

const updateSchema = z.object({

    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),    // ✅ Add price
    category: z.string().optional(),         // ✅ Add category
    inStock: z.boolean().optional(),         // ✅ Add stock

});

export const menuItemValidation = {
  createSchema,
  updateSchema,
};