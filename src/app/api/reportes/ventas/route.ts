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

    // 📌 Paginación
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    // 📌 Agrupamos ventas por día
    const raw = await prisma.venta.groupBy({
      by: ["fecha"],
      _count: { id: true },
      _sum: { total: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA", // solo ventas confirmadas cuentan
      },
      orderBy: { fecha: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 📌 Transformamos fecha a YYYY-MM-DD
    const result = raw.map((r) => ({
      fecha: r.fecha.toISOString().split("T")[0],
      cantidadVentas: r._count.id,
      totalVendido: r._sum.total ?? 0,
    }));

    // 📌 Total de días distintos con ventas
    const total = await prisma.venta.groupBy({
      by: ["fecha"],
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA",
      },
    });

    return response({
      data: {
        page,
        limit,
        total: total.length,
        desde,
        hasta,
        ventasPorDia: result,
      },
      message: "Reporte de ventas por día generado correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al generar reporte de ventas" }, 500);
  }
}
