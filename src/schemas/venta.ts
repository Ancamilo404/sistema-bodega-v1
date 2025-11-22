import { z } from "zod";

export const ventaItemSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().min(1),
  precioUnitario: z.number().positive(),
  descuento: z.number().nonnegative().optional(),
  iva: z.number().nonnegative().optional(),
  observaciones: z.string().optional(),
});

export const ventaSchema = z.object({
  clienteId: z.number().int().positive(),
  metodoPago: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA", "OTRO"]),
  observaciones: z.string().optional(),
  impuesto: z.number().nonnegative().optional(),
  descuento: z.number().nonnegative().optional(),
  items: z.array(ventaItemSchema).min(1, "Debe haber al menos un producto en la venta"),
});
