import { z } from "zod";

export const ventaProductoUpdateSchema = z.object({
  productoId: z.number().int().positive().optional(), // por si se reasigna a otro producto
  cantidad: z.number().int().min(1).optional(),
  precioUnitario: z.number().positive().optional(),
  subtotal: z.number().nonnegative().optional(),
  descuento: z.number().nonnegative().optional(),
  iva: z.number().nonnegative().optional(),
  observaciones: z.string().optional(),
});
  