// src/lib/errors.ts
export const Errors = {
  NoAutorizado: { status: 403, error: "No autorizado" },
  EntradaInvalida: (msg = "Entrada inválida") => ({ status: 400, error: msg }),
  EntidadNoEncontrada: (nombre = "Entidad") => ({ status: 404, error: `${nombre} no encontrado` }),
  Duplicado: (campo = "Documento") => ({ status: 409, error: `${campo} ya registrado` }),
  ErrorServidor: (msg = "Error interno") => ({ status: 500, error: msg }),
};
