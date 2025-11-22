"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ProductoData {
  nombre: string;
  total: number;
}

export default function ProductosChart({ tipo }: { tipo: "ventas" | "stock" }) {
  const [data, setData] = useState<ProductoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/reportes/productos");
        const json = await res.json();

        const productos = Array.isArray(json?.data?.productos) ? json.data.productos : [];
        setData(productos.map((p: any) => ({ nombre: p.nombre, total: p.totalVendido || 0 })));
      } catch (error) {
        console.error("Error cargando productos:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo]);

  if (loading) return <div className="spinner"></div>; // 👈 cambio aquí
  if (!Array.isArray(data) || data.length === 0) return <div>No hay datos de productos</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill={tipo === "ventas" ? "var(--color-blue-1)" : "var(--color-warning)"} />
      </BarChart>
    </ResponsiveContainer>
  );
}
