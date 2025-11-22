import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 📌 Filtros de fecha
    let desde = searchParams.get("desde");
    let hasta = searchParams.get("hasta");
    if (!desde || !hasta) {
      const h = new Date();
      const d = new Date();
      d.setDate(h.getDate() - 30);
      desde = d.toISOString();
      hasta = h.toISOString();
    }

    // 📌 Paginación
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    // 📌 Ejemplo de agrupación (ajusta según el reporte)
    const raw = await prisma.venta.groupBy({
      by: ["clienteId"], // 👈 aquí cambias el campo según el reporte
      _count: { id: true },
      where: {
        fecha: { gte: new Date(desde), lte: new Date(hasta) },
        estado: { not: "ANULADA" },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 📌 Enriquecer resultados (ejemplo: traer nombre del cliente)
    const result = await Promise.all(
      raw.map(async (r) => {
        const cliente = await prisma.cliente.findUnique({
          where: { id: r.clienteId },
          select: { nombre: true },
        });
        return {
          id: r.clienteId,
          nombre: cliente?.nombre ?? "Desconocido",
          total: r._count.id,
        };
      })
    );

    // 📌 Total para frontend
    const total = await prisma.venta.count({
      where: { fecha: { gte: new Date(desde), lte: new Date(hasta) }, estado: { not: "ANULADA" } },
    });

    return response({
      data: { page, limit, total, desde, hasta, items: result },
      message: "Reporte generado correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al generar reporte" }, 500);
  }
}
