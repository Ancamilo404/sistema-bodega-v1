"use client";
import { useHistorial } from "@/hooks/useHistorial";
import type { TipoAccion } from "@/types/historial";

export default function AuditoriaPage() {
  const {
    items,
    loading,
    error,
    page,
    limit,
    setPage,
    setLimit,
  } = useHistorial({ limit: 20 });

  return (
    <div style={{ padding: 24 }}>
      <h1>Auditoría</h1>

      {/* Filtros básicos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          margin: "12px 0",
        }}
      >
        <input placeholder="Entidad (Venta, Producto...)" />
        <input placeholder="Usuario ID" type="number" />
        <select>
          <option value="">Tipo</option>
          <option value="CREAR">CREAR</option>
          <option value="ACTUALIZAR">ACTUALIZAR</option>
          <option value="ELIMINAR">ELIMINAR</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
        </select>
      </div>

      {/* Estados */}
      {loading && <div>Cargando historial...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!loading && !items?.length && <div>No hay registros</div>}

      {/* Tabla */}
      {!!items?.length && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>Detalle</th>
              <th>Usuario</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.fecha}</td>
                <td>{i.tipo}</td>
                <td>{i.accion}</td>
                <td>
                  {i.entidad ? `${i.entidad}${i.entidadId ? ` #${i.entidadId}` : ""}` : "-"}
                </td>
                <td>{i.detalle ? i.detalle.slice(0, 120) : "-"}</td>
                <td>{i.usuario ? `${i.usuario.nombre} (${i.usuario.rol})` : "-"}</td>
                <td>{i.ip || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <span>
          Página {page}
        </span>
        <button onClick={() => setPage(page + 1)}>Siguiente</button>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
