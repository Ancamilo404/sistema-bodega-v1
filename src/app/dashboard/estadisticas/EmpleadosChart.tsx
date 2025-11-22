"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface EmpleadoData {
  nombre: string;
  total: number;
}

export default function EmpleadosChart() {
  const [data, setData] = useState<EmpleadoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - 30);

        const res = await fetch(`/api/reportes/usuario?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`);
        const json = await res.json();

        const empleados = Array.isArray(json?.data?.empleados) ? json.data.empleados : [];
        setData(empleados.map((e: any) => ({ nombre: e.nombre, total: e.totalVendido || 0 })));
      } catch (error) {
        console.error("Error cargando empleados:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner"></div>; // 👈 cambio aquí
  if (!Array.isArray(data) || data.length === 0) return <div>No hay datos de empleados</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="var(--color-warning)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
