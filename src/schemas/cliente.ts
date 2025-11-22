// schemas/clientes.ts
import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipoId: z.enum(["CC", "TI", "CE", "PASAPORTE", "NIT"], {required_error: "El tipo de documento es obligatorio",}),
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .regex(/^[0-9]+$/, "El documento debe contener solo números ni espacios"),
  direccion: z.string().optional(),
  telefono: z.string()
    .regex(/^[0-9]+$/, "El teléfono debe contener solo números ni espacios")
    .optional(),
  estado: z.enum(["ACTIVO", "BLOQUEADO"]),
});
