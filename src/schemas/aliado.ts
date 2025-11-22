import { z } from "zod";

export const aliadoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipoId: z.enum(["CC", "TI", "CE", "PASAPORTE", "NIT"], {
    required_error: "El tipo de documento es obligatorio",
  }),
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .regex(/^[0-9]+$/, "El documento debe contener solo números ni espacios"),
  telefono: z.string()
    .regex(/^[0-9]+$/, "El teléfono debe contener solo números")
    .optional(),
  correo: z.string().email("Correo inválido").optional(),
  direccion: z.string().optional(),
  imagen: z.string().optional(),
  estado: z.enum(["ACTIVO", "BLOQUEADO"]),
});