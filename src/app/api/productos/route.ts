import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { productoSchema } from '@/schemas/producto';
import formatDateTime from '@/lib/formatDate';

// GET /api/productos?search=...&estado=...&precioMin=...&precioMax=...&fechaInicio=...&fechaFin=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    let query = `
      SELECT 
        p.*,
        json_build_object(
          'id', a.id,
          'nombre', a.nombre,
          'documento', a.documento
        ) as aliado,
        ts_rank(
          to_tsvector('spanish',
            coalesce(p.nombre,'') || ' ' ||
            coalesce(p.descripcion,'') || ' ' ||
            coalesce(p.categoria,'') || ' ' ||
            coalesce(p.unidad,'')
          ),
          plainto_tsquery('spanish', $1)
        ) AS rank
      FROM "Producto" p
      LEFT JOIN "Aliado" a ON p."aliadoId" = a.id
      WHERE p."deletedAt" IS NULL
      AND (
        $1 = '' OR
        to_tsvector('spanish',
          coalesce(p.nombre,'') || ' ' ||
          coalesce(p.descripcion,'') || ' ' ||
          coalesce(p.categoria,'') || ' ' ||
          coalesce(p.unidad,'')
        ) @@ plainto_tsquery('spanish', $1)
        OR p.nombre ILIKE '%' || $1 || '%'
        OR p.descripcion ILIKE '%' || $1 || '%'
        OR p.categoria ILIKE '%' || $1 || '%'
        OR p.unidad ILIKE '%' || $1 || '%'
        OR CAST(p.id AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(p.estado AS TEXT) ILIKE '%' || $1 || '%'
      )
    `;

    const params: any[] = [search];

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      query += ` AND p.estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (precioMin && precioMax) {
      query += ` AND p.precio BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(Number(precioMin), Number(precioMax));
    }

    if (fechaInicio && fechaFin) {
      query += ` AND p."creadoEn" BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(new Date(fechaInicio), new Date(fechaFin));
    }

    query += ` ORDER BY rank DESC, p."creadoEn" DESC`;

    const productos = await prisma.$queryRawUnsafe(query, ...params);

    const productosSerializados = productos.map(p => ({
      ...p,
      aliado: typeof p.aliado === 'string' ? JSON.parse(p.aliado) : p.aliado,
      precio: Number(p.precio),
      creadoEn: formatDateTime(p.creadoEn),
      actualizadoEn: formatDateTime(p.actualizadoEn),
    }));

    return response({
      data: productosSerializados,
      message: 'Productos listados correctamente',
    });
  } catch (e: any) {
    console.error('Error en /api/productos:', e);
    return response({ error: e.message || 'Error al listar productos' }, 500);
  }
}

// POST /api/productos → crea o reactiva producto
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, productoSchema);

    // ⚡ Normalizar aliadoId vacío
    const data = {
      ...body,
      aliadoId: body.aliadoId ?? undefined,
    };

    // Buscar duplicados
    const existing = await prisma.producto.findFirst({
      where: {
        nombre: data.nombre,
        aliadoId: data.aliadoId ?? null,
      },
    });

    let result;
    if (existing && existing.deletedAt) {
      // ✅ Reactivar producto archivado
      result = await prisma.producto.update({
        where: { id: existing.id },
        data: { ...data, deletedAt: null, estado: 'ACTIVO' },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Producto ${result.nombre} reactivado`,
        entidad: 'Producto',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            creadoEn: result.creadoEn.toISOString(),
            actualizadoEn: result.actualizadoEn.toISOString(),
          },
          message: 'Producto reactivado correctamente',
        },
        200
      );
    } else if (existing) {
      return response({ error: 'Producto ya registrado para este aliado' }, 409);
    }

    // ✅ Crear producto nuevo
    result = await prisma.producto.create({ data });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Producto ${result.nombre} creado`,
      entidad: 'Producto',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          creadoEn: result.creadoEn.toISOString(),
          actualizadoEn: result.actualizadoEn.toISOString(),
        },
        message: 'Producto creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear producto' }, 500);
  }
}
