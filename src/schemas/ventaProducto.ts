import { z } from "zod";

export const ventaProductoCreateSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().min(1),
  precioUnitario: z.number().positive(),
  descuento: z.number().nonnegative().optional(),
  iva: z.number().nonnegative().optional(),
  observaciones: z.string().optional(),
});
