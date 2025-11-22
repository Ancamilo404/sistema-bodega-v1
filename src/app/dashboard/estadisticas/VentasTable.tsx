"use client";
import { useEffect, useState } from "react";

export default function VentasTable() {
  const [rows, setRows] = useState<{ fecha: string; cantidadVentas: number; totalVendido: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - 14);
        const res = await fetch(`/api/reportes/ventas?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`);
        const json = await res.json();
        const ventas = Array.isArray(json?.data?.ventasPorDia) ? json.data.ventasPorDia : [];
        setRows(ventas);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner"></div>; // 👈 cambio aquí
  if (!rows.length) return <div>No hay datos de ventas</div>;

  return (
    <table className="ventas-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Ventas</th>
          <th>Total vendido</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((v, i) => (
          <tr key={i}>
            <td>{v.fecha}</td>
            <td>{v.cantidadVentas}</td>
            <td>${v.totalVendido ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
