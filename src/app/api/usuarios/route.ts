import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { usuarioSchema } from '@/schemas/usuario';
import bcrypt from 'bcrypt';
import DOMPurify from 'isomorphic-dompurify';

// GET /api/usuarios?search=...&estado=...&correo=...&documento=...&fechaInicio=...&fechaFin=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const estado = searchParams.get('estado')?.toUpperCase();
    const correo = searchParams.get('correo') || '';
    const documento = searchParams.get('documento') || '';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    let query = `
      SELECT 
        u.*,
        ts_rank(
          to_tsvector('spanish',
            coalesce(u.nombre,'') || ' ' ||
            coalesce(u.correo,'') || ' ' ||
            coalesce(u.documento,'') || ' ' ||
            coalesce(u.telefono,'')
          ),
          plainto_tsquery('spanish', $1)
        ) AS rank
      FROM "Usuario" u
      WHERE u."deletedAt" IS NULL
      AND (
        $1 = '' OR
        to_tsvector('spanish',
          coalesce(u.nombre,'') || ' ' ||
          coalesce(u.correo,'') || ' ' ||
          coalesce(u.documento,'') || ' ' ||
          coalesce(u.telefono,'')
        ) @@ plainto_tsquery('spanish', $1)
        OR u.nombre ILIKE '%' || $1 || '%'
        OR u.correo ILIKE '%' || $1 || '%'
        OR u.documento ILIKE '%' || $1 || '%'
        OR u.telefono ILIKE '%' || $1 || '%'
        OR CAST(u.id AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(u."fechaRegistro" AS TEXT) ILIKE '%' || $1 || '%'
        OR ($1 <> '' AND CAST(u."tipoId" AS TEXT) ILIKE '%' || $1 || '%')
        OR ($1 <> '' AND CAST(u.rol AS TEXT) ILIKE '%' || $1 || '%')
        OR ($1 <> '' AND CAST(u.estado AS TEXT) ILIKE '%' || $1 || '%')
      )
    `;

    const params: any[] = [search];

    if (estado && ['ACTIVO', 'BLOQUEADO'].includes(estado)) {
      query += ` AND u.estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (correo) {
      query += ` AND u.correo = $${params.length + 1}`;
      params.push(correo.toLowerCase());
    }

    if (documento) {
      query += ` AND u.documento = $${params.length + 1}`;
      params.push(documento);
    }

    if (fechaInicio && fechaFin) {
      query += ` AND u."fechaRegistro" BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(new Date(fechaInicio), new Date(fechaFin));
    }

    query += ` ORDER BY rank DESC, u."fechaRegistro" DESC`;

    const usuarios = await prisma.$queryRawUnsafe(query, ...params);

    // ✅ Serializar fechas
    const usuariosSerializados = (usuarios as any[]).map(u => ({
      ...u,
      fechaRegistro: u.fechaRegistro?.toISOString() || null,
    }));

    return response({
      data: usuariosSerializados,
      message: 'Usuarios listados correctamente',
    });
  } catch (e: any) {
    console.error('Error en /api/usuarios:', e);
    return response({ error: e.message || 'Error al listar usuarios' }, 500);
  }
}

// POST /api/usuarios → crea o reactiva usuario

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);   // ✅ ahora sí espera el resultado
    if (!user || user.rol !== 'ADMIN') {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, usuarioSchema);
    // Sanitizar campos
    if (body.documento) body.documento = DOMPurify.sanitize(body.documento.trim());
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = DOMPurify.sanitize(body.correo.trim());

    const hashedPassword = body.password ? await bcrypt.hash(body.password, 10) : undefined;

    // Buscar si ya existe usuario con mismo documento
    const existing = await prisma.usuario.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      // ✅ Reactivar usuario archivado
      result = await prisma.usuario.update({
        where: { id: existing.id },
        data: { ...body, password: hashedPassword, deletedAt: null, estado: 'ACTIVO' },
      });

      await logHistorial({
        tipo: 'ACTUALIZAR',
        accion: `Usuario ${result.nombre} reactivado`,
        entidad: 'Usuario',
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get('x-forwarded-for') || undefined,
      });

      return response(
        {
          data: {
            ...result,
            fechaRegistro: result.fechaRegistro.toISOString(),
          },
          message: 'Usuario reactivado correctamente',
        },
        200
      );
    }

    if (existing) {
      return response({ error: 'Documento ya registrado' }, 409);
    }

    // ✅ Crear usuario nuevo
    result = await prisma.usuario.create({
      data: { ...body, password: hashedPassword },
    });

    await logHistorial({
      tipo: 'CREAR',
      accion: `Usuario ${result.nombre} creado`,
      entidad: 'Usuario',
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response(
      {
        data: {
          ...result,
          fechaRegistro: result.fechaRegistro.toISOString(),
        },
        message: 'Usuario creado correctamente',
      },
      201
    );
  } catch (e: any) {
    if (e.code === 'P2002') return response({ error: 'Documento o correo ya registrado' }, 409);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al crear usuario' }, 500);
  }
}