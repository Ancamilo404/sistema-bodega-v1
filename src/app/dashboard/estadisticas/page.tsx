"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientesChart from "./ClientesChart";
import EmpleadosChart from "./EmpleadosChart";
import ProductosChart from "./ProductosChart";
import VentasTable from "./VentasTable";
import KPICard from "../../components/KPICard"; // 👈 ojo: sube un nivel
import "./Estadisticas.css";

interface DashboardData {
  desde: string;
  hasta: string;
  resumen: {
    cantidadVentas: number;
    totalVendido: number;
  };
  topClientes: any[];
  topProductos: any[];
  topEmpleados: any[];
}

export default function EstadisticasPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/meta/dashboard", { credentials: "include" });
        if (res.status === 403) {
          router.push("/noAutorizado");
          return;
        }
      } catch (e) {
        router.push("/noAutorizado");
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/reportes/dashboard");
        const json = await res.json();
        setData(json.data); // 👈 importante: usar json.data
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);


  if (loadingAuth) return <div className="dashboard">Verificando permisos...</div>;
  if (loading) return <div className="dashboard">Cargando datos...</div>;
  if (!data) return <div className="dashboard">No se pudieron cargar los datos</div>;
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Estadísticas</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard
      title="Ventas confirmadas"
      value={data.resumen.cantidadVentas}
      description="Ventas confirmadas en el rango seleccionado."
    />
    <KPICard
      title="Total vendido"
      value={`$${data.resumen.totalVendido ?? 0}`}
      description="Suma total vendida (solo ventas confirmadas)."
    />
    <KPICard
      title="Top clientes"
      value={data.topClientes?.length ?? 0}
      description="Número de clientes en el top del período."
    />
    <KPICard
      title="Top empleados"
      value={data.topEmpleados?.length ?? 0}
      description="Número de empleados con ventas destacadas."
    />
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        <div className="chart-box">
          <h2 className="section-title">Clientes</h2>
          <p className="chart-description">
            Aquí vemos cuántos clientes nuevos se han sumado con el tiempo.
            Si la barra sube, significa que más personas están comprando.
          </p>
          <ClientesChart />
        </div>

        <div className="chart-box">
          <h2 className="section-title">Empleados</h2>
          <p className="chart-description">
            Esta gráfica muestra cuántos empleados hay y cómo están repartidos.
            Sirve para ver si el equipo crece o se mantiene igual.
          </p>
          <EmpleadosChart />
        </div>

        <div className="chart-box">
          <h2 className="section-title">Productos - Ventas</h2>
          <p className="chart-description">
            Aquí se ven los productos más vendidos.
            Cuanto más alta la barra, más veces se ha vendido ese producto.
          </p>
          <ProductosChart tipo="ventas" />
        </div>

        <div className="chart-box">
          <h2 className="section-title">Productos - Stock</h2>
          <p className="chart-description">
            Esta gráfica muestra cuántos productos quedan en la bodega.
            Si la barra es baja, significa que pronto habrá que reponer.
          </p>
          <ProductosChart tipo="stock" />
        </div>
      </div>

      {/* Tabla de últimas ventas */}
      <div className="table-section">
        <h2 className="section-title">Últimas Ventas</h2>
        <p className="chart-description">
          Aquí aparece la lista de las ventas más recientes: quién compró,
          qué día fue, cuánto pagó y si la venta está confirmada.
        </p>
        <VentasTable />
      </div>
    </div>
  );
}
