// src/types/historial.ts
export type TipoAccion = "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "LOGIN" | "LOGOUT";

export interface HistorialItemDTO {
  id: number;
  fecha: string; // ISO
  tipo: TipoAccion;
  accion: string;
  entidad?: string | null;   // "Producto", "Venta", etc.
  entidadId?: number | null;
  detalle?: string | null;   // JSON string o texto plano
  ip?: string | null;
  usuario: { id: number; nombre: string; rol: "ADMIN" | "TRABAJADOR" | "USUARIO" } | null;
}

export interface HistorialResponseDTO {
  page: number;
  limit: number;
  total: number;
  items: HistorialItemDTO[];
}
