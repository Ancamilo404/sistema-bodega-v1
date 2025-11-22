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

    // 📌 Agrupamos ventas por usuario (empleado/trabajador)
    const raw = await prisma.venta.groupBy({
      by: ["usuarioId"],
      _count: { id: true },
      _sum: { total: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: "CONFIRMADA",
      },
      orderBy: { _sum: { total: "desc" } }, // 👈 ordenamos por monto vendido
      skip: (page - 1) * limit,
      take: limit,
    });

    // 📌 Enriquecemos con nombre del usuario
    const result = await Promise.all(
      raw.map(async (r) => {
        const user = await prisma.usuario.findUnique({
          where: { id: r.usuarioId },
          select: { nombre: true, rol: true },
        });
        return {
          usuarioId: r.usuarioId,
          nombre: user?.nombre ?? "Desconocido",
          rol: user?.rol ?? "N/A",
          cantidadVentas: r._count.id,
          totalVendido: r._sum.total ?? 0,
        };
      })
    );

    // 📌 Total de empleados con ventas en el rango
    const total = await prisma.venta.groupBy({
      by: ["usuarioId"],
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
        empleados: result,
      },
      message: "Reporte de empleados generado correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al generar reporte de empleados" }, 500);
  }
}
