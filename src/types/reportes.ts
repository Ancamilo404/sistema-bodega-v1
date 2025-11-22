// src/types/reportes.ts
export interface ReporteClientesItem {
  id: number;
  nombre: string;
  total: number; // cantidad de ventas (o monto, según endpoint)
}

export interface ReporteEmpleadosItem {
  usuarioId: number;
  nombre: string;
  rol: string;
  cantidadVentas: number;
  totalVendido: number;
}

export interface ReporteProductosItem {
  productoId: number;
  nombre: string;
  estado: string;
  totalVendido: number;
}

export interface VentasPorDiaItem {
  fecha: string;           // YYYY-MM-DD
  cantidadVentas: number;
  totalVendido: number;
}

export interface ReporteApiResponse<T> {
  data: {
    page: number;
    limit: number;
    total: number;
    desde: string;
    hasta: string;
    // items clave según el endpoint:
    items?: T[];
    empleados?: ReporteEmpleadosItem[];
    productos?: ReporteProductosItem[];
    ventasPorDia?: VentasPorDiaItem[];
  };
  message: string | null;
  error: string | null;
}
