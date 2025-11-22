// src/schemas/productoUpdate.ts
import { z } from "zod";

export const productoUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  precio: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoria: z.string().optional(),
  unidad: z.string().optional(),
  imagen: z.string().optional(),
  estado: z.enum(["ACTIVO", "BLOQUEADO"]).optional(),
  aliadoId: z.number().int().positive().nullable().optional(),
});
