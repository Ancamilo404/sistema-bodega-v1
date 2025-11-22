import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { clienteSchema } from '@/schemas/cliente';
import DOMPurify from 'isomorphic-dompurify';

// GET /api/clientes?search=...&estado=...&documento=...&fechaInicio=...&fechaFin=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const documento = searchParams.get('documento') || '';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    let query = `
SELECT 
  c.*,
  CAST((SELECT COUNT(*) FROM "Venta" v WHERE v."clienteId" = c.id AND v.estado = 'CONFIRMADA') AS INTEGER) as "ventasCount",
  ts_rank(
    to_tsvector('spanish',
      coalesce(c.nombre,'') || ' ' ||
      coalesce(c.documento,'') || ' ' ||
      coalesce(c.direccion,'') || ' ' ||
      coalesce(c.telefono,'')
    ),
    plainto_tsquery('spanish', $1)
  ) AS rank
    FROM "Cliente" c
      WHERE c."deletedAt" IS NULL
      AND (
        $1 = '' OR
        to_tsvector('spanish',
          coalesce(c.nombre,'') || ' ' ||
          coalesce(c.documento,'') || ' ' ||
          coalesce(c.direccion,'') || ' ' ||
          coalesce(c.telefono,'')
        ) @@ plainto_tsquery('spanish', $1)
        OR c.nombre ILIKE '%' || $1 || '%'
        OR c.documento ILIKE '%' || $1 || '%'
        OR c.direccion ILIKE '%' || $1 || '%'
        OR c.telefono ILIKE '%' || $1 || '%'
        OR CAST(c.id AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(c."tipoId" AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(c."fechaRegistro" AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(c.estado AS TEXT) ILIKE '%' || $1 || '%'
      )
    `;

    const params: any[] = [search];

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      query += ` AND c.estado = ${params.length + 1}`;
      params.push(estado);
    }

    if (documento) {
      query += ` AND c.documento = ${params.length + 1}`;
      params.push(documento);
    }

    if (fechaInicio && fechaFin) {
      query += ` AND c."fechaRegistro" BETWEEN ${params.length + 1} AND ${params.length + 2}`;
      params.push(new Date(fechaInicio), new Date(fechaFin));
    }

    query += ` ORDER BY rank DESC, c."fechaRegistro" DESC`;

    const clientes = await prisma.$queryRawUnsafe(query, ...params);

    // ✅ Serializar fechas y agregar conteo
    const clientesSerializados = (clientes as any[]).map(c => ({
      ...c,
      fechaRegistro: c.fechaRegistro?.toISOString() || null,
      ventas: Number(c.ventasCount || 0), // ⬅️ PostgreSQL devuelve en minúsculas
    }));

    return response({
      data: clientesSerializados,
      message: 'Clientes listados correctamente',
    });
  } catch (e: any) {
    console.error('Error en /api/clientes:', e);
    return response({ error: e.message || 'Error al listar clientes' }, 500);
  }
}

// POST /api/clientes → crea o reactiva cliente
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, clienteSchema);
    if (body.documento) {
      body.documento = DOMPurify.sanitize(body.documento.trim());
    }
    if (body.telefono) body.telefono = body.telefono.trim();

    const existing = await prisma.cliente.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      result = await prisma.cliente.update({
        where: { id: existing.id },
        data: {
          ...body,
          deletedAt: null,
          estado: 'ACTIVO',
        },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Cliente ${result.nombre} reactivado`,
        entidad: 'Cliente',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
          },
          message: 'Cliente reactivado correctamente',
        },
        200
      );
    }

    if (existing) {
      return response({ error: 'Documento ya registrado' }, 409);
    }

    result = await prisma.cliente.create({ data: body });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Cliente ${result.nombre} creado`,
      entidad: 'Cliente',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
        },
        message: 'Cliente creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear cliente' }, 500);
  }
}
