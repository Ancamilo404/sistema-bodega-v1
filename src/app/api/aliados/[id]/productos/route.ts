import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";

// GET /api/aliados/:id/productos?page=1&limit=20
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const aliadoId = Number(params.id);
    const aliado = await prisma.aliado.findUnique({ where: { id: aliadoId } });
    if (!aliado) {
      return response({ error: "Aliado no encontrado" }, 404);
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const [items, total] = await Promise.all([
      prisma.producto.findMany({
        where: { aliadoId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { creadoEn: "desc" },
      }),
      prisma.producto.count({ where: { aliadoId, deletedAt: null } }),
    ]);

    return response({
      data: { page, limit, total, items },
      message: "Productos listados correctamente",
    });
  } catch (e: any) {
    console.error("Error en /api/aliados/:id/productos:", e);
    return response({ error: e.message || "Error al listar productos" }, 500);
  }
}