import { z } from "zod";

export const usuarioUpdateSchema = z.object({
  nombre: z.string()
    .min(4, "El nombre debe tener al menos 4 caracteres")
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, "El nombre solo puede contener letras y espacios")
    .optional(),

  tipoId: z.enum(["CC", "TI", "CE", "PASAPORTE", "NIT"]).optional(),

  documento: z.string()
    .min(1, "El documento es obligatorio")
    .regex(/^[0-9]+$/, "El documento debe contener solo números ni espacios")
    .optional(),

  correo: z.string()
    .email("Correo inválido")
    .transform((val) => val.toLowerCase())
    .optional(),

  telefono: z.string()
    .regex(/^[0-9]+$/, "El teléfono debe contener solo números")
    .optional(),

  rol: z.enum(["ADMIN", "TRABAJADOR", "USUARIO"]).optional(),

  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "La contraseña solo puede contener letras y números")
    .optional(),

  estado: z.enum(["ACTIVO", "BLOQUEADO"]).optional(),
});
