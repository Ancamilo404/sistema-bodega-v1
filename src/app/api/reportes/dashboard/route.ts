import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 📌 Filtros de fecha (últimos 30 días por defecto)
    let desde = searchParams.get("desde");
    let hasta = searchParams.get("hasta");
    if (!desde || !hasta) {
      const hoy = new Date();
      const hace30 = new Date();
      hace30.setDate(hoy.getDate() - 30);
      desde = hace30.toISOString();
      hasta = hoy.toISOString();
    }

    // 📊 Totales globales
    const totalVentas = await prisma.venta.aggregate({
      _count: { id: true },
      _sum: { total: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA",
      },
    });

    // 📊 Top 5 clientes
    const topClientes = await prisma.venta.groupBy({
      by: ["clienteId"],
      _count: { id: true },
      _sum: { total: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA",
      },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    // 📊 Top 5 productos
    const topProductos = await prisma.ventaProducto.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      where: {
        venta: {
          fecha: { gte: new Date(desde), lte: new Date(hasta) },
          estado: "CONFIRMADA",
        },
      },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    });

    // 📊 Top 5 empleados
    const topEmpleados = await prisma.venta.groupBy({
      by: ["usuarioId"],
      _count: { id: true },
      _sum: { total: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA",
      },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    return response({
      data: {
        desde,
        hasta,
        resumen: {
          cantidadVentas: totalVentas._count.id,
          totalVendido: totalVentas._sum.total ?? 0,
        },
        topClientes,
        topProductos,
        topEmpleados,
      },
      message: "Dashboard generado correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al generar dashboard" }, 500);
  }
}
