// schemas/clienteUpdate.ts
import { z } from "zod";

export const clienteUpdateSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").optional(),
  tipoId: z.enum(["CC", "TI", "CE", "PASAPORTE", "NIT"], {required_error: "El tipo de documento es obligatorio",}),
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .regex(/^[0-9]+$/, "El documento debe contener solo números ni espacios")
    .optional(),
  direccion: z.string().optional(),
  telefono: z.string()
    .regex(/^[0-9]+$/, "El teléfono debe contener solo números ni espacios")
    .optional(),
  estado: z.enum(["ACTIVO", "BLOQUEADO"]).optional(),
});
