// src/app/modules/Table/table.validation.ts
import { z } from 'zod';

const createSchema = z.object({

    tableNumber: z.string().min(1, 'Table number is required'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').default(4),
    status: z.enum([
      "AVAILABLE", 
      "OCCUPIED", 
      "RESERVED",
      "DIRTY",
      "SEATED",
      "ORDERING",
      "EATING",
      "BILL_REQUESTED"
    ]).optional().default("AVAILABLE"),

});

const updateSchema = z.object({

    tableNumber: z.string().optional(),
    capacity: z.number().int().min(1).optional(),
    status: z.enum([
      "AVAILABLE", 
      "OCCUPIED", 
      "RESERVED",
      "DIRTY",
      "SEATED",
      "ORDERING",
      "EATING",
      "BILL_REQUESTED"
    ]).optional(),

});

export const tableValidation = {
  createSchema,
  updateSchema,
};