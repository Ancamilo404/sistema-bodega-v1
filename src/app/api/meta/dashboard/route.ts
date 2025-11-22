import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req: Request) {
  try {
    // 🚩 usar await
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const [totalClientes, totalEmpleados, totalProductos, totalVentas] = await Promise.all([
      prisma.cliente.count(),
      prisma.usuario.count({ where: { rol: { in: ["ADMIN", "TRABAJADOR"] }, estado: "ACTIVO" } }),
      prisma.producto.count({ where: { estado: "ACTIVO" } }),
      prisma.venta.count(),
    ]);

    return response({
      data: { totalClientes, totalEmpleados, totalProductos, totalVentas },
      message: "KPIs meta obtenidos correctamente",
    });
  } catch (e: any) {
    return response({ error: e.message || "Error al obtener KPIs" }, 500);
  }
}
