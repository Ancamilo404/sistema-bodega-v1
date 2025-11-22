import { z } from "zod";

export const usuarioPublicSchema = z.object({
  nombre: z.string()
    .min(4, "El nombre debe tener al menos 4 caracteres")
    .regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, "El nombre solo puede contener letras y espacios"),
  correo: z.string()
    .email("Correo inválido")
    .transform((val) => (val ? val.toLowerCase() : val)),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "La contraseña solo puede contener letras y números"),
});