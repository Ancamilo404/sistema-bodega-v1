"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ClienteData {
  nombre: string;
  total: number;
}

export default function ClientesChart() {
  const [data, setData] = useState<ClienteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - 30);

        const res = await fetch(`/api/reportes/clientes?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`);
        const json = await res.json();

        const items = Array.isArray(json?.data?.items) ? json.data.items : [];
        setData(items.map((i: any) => ({ nombre: i.nombre, total: i.total })));
      } catch (error) {
        console.error("Error cargando clientes:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner"></div>; // 👈 cambio aquí
  if (!Array.isArray(data) || data.length === 0) return <div>No hay datos de clientes</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="nombre" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="var(--color-success)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
