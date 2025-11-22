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

    // 📌 Agrupamos ventas por producto
    const raw = await prisma.ventaProducto.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      where: {
        venta: {
          fecha: { gte: new Date(desde), lte: new Date(hasta) },
          estado: { not: "ANULADA" },
        },
      },
      orderBy: { _sum: { cantidad: "desc" } }, // 👈 ordenamos por más vendidos
      skip: (page - 1) * limit,
      take: limit,
    });

    // 📌 Enriquecemos con nombre y estado del producto
    const result = await Promise.all(
      raw.map(async (r) => {
        const prod = await prisma.producto.findUnique({
          where: { id: r.productoId },
          select: { nombre: true, estado: true },
        });
        return {
          productoId: r.productoId,
          nombre: prod?.nombre ?? "Desconocido",
          estado: prod?.estado ?? "N/A",
          totalVendido: r._sum.cantidad ?? 0,
        };
      })
    );

    // 📌 Total de productos distintos vendidos en el rango
    const total = await prisma.ventaProducto.groupBy({
      by: ["productoId"],
      where: {
        venta: {
          fecha: { gte: new Date(desde), lte: new Date(hasta) },
          estado: { not: "ANULADA" },
        },
      },
    });

    return response({
      data: {
        page,
        limit,
        total: total.length,
        desde,
        hasta,
        productos: result,
      },
      message: "Reporte de productos generado correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al generar reporte de productos" }, 500);
  }
}
