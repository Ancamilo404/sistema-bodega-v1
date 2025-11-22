import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';

// GET /api/clientes/:id/ventas?page=1&limit=20
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const clienteId = Number(params.id);
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return response({ error: 'Cliente no encontrado' }, 404);
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);

    const [items, total] = await Promise.all([
      prisma.venta.findMany({
        where: { clienteId, estado: 'CONFIRMADA' }, // ⬅️ solo confirmadas
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fecha: 'desc' },
      }),
      prisma.venta.count({ where: { clienteId, estado: 'CONFIRMADA' } }),
    ]);

    return response({
      data: { page, limit, total, items },
      message: 'Ventas obtenidas correctamente',
    });
  } catch (e: any) {
    console.error('Error en /api/clientes/:id/ventas:', e);
    return response({ error: e.message || 'Error al obtener ventas' }, 500);
  }
}
