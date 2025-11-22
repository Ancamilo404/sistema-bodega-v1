import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.number().positive(),
  stock: z.number().int().min(0),
  categoria: z.string().optional(),
  unidad: z.string().optional(),
  imagen: z.string().optional(),
  estado: z.enum(["ACTIVO", "BLOQUEADO"]),
aliadoId: z.number().int().positive().nullable().optional(),

  
});
