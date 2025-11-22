import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { logHistorial } from "@/lib/logHistorial";
import { validateBody } from "@/lib/validateBody";
import { aliadoSchema } from "@/schemas/aliado";
import DOMPurify from "isomorphic-dompurify";

// GET /api/aliados?search=...&estado=...&documento=...&fechaInicio=...&fechaFin=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado")?.toUpperCase();
    const documento = searchParams.get("documento") || "";
    const fechaInicio = searchParams.get("fechaInicio");
    const fechaFin = searchParams.get("fechaFin");

    let query = `
      SELECT 
        a.*,
        CAST((SELECT COUNT(*) FROM "Producto" p WHERE p."aliadoId" = a.id AND p."deletedAt" IS NULL) AS INTEGER) as "productosCount",
        ts_rank(
          to_tsvector('spanish',
            coalesce(a.nombre,'') || ' ' ||
            coalesce(a.documento,'') || ' ' ||
            coalesce(a.telefono,'') || ' ' ||
            coalesce(a.correo,'') || ' ' ||
            coalesce(a.direccion,'')
          ),
          plainto_tsquery('spanish', $1)
        ) AS rank
      FROM "Aliado" a
      WHERE a."deletedAt" IS NULL
      AND (
        $1 = '' OR
        to_tsvector('spanish',
          coalesce(a.nombre,'') || ' ' ||
          coalesce(a.documento,'') || ' ' ||
          coalesce(a.telefono,'') || ' ' ||
          coalesce(a.correo,'') || ' ' ||
          coalesce(a.direccion,'')
        ) @@ plainto_tsquery('spanish', $1)
        OR a.nombre ILIKE '%' || $1 || '%'
        OR a.documento ILIKE '%' || $1 || '%'
        OR a.telefono ILIKE '%' || $1 || '%'
        OR a.correo ILIKE '%' || $1 || '%'
        OR a.direccion ILIKE '%' || $1 || '%'
        OR CAST(a.id AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(a."tipoId" AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(a."fechaRegistro" AS TEXT) ILIKE '%' || $1 || '%'
        OR CAST(a.estado AS TEXT) ILIKE '%' || $1 || '%'
      )
    `;

    const params: any[] = [search];

    if (estado && ["ACTIVO", "BLOQUEADO"].includes(estado)) {
      query += ` AND a.estado = $${params.length + 1}`;
      params.push(estado);
    }

    if (documento) {
      query += ` AND a.documento = $${params.length + 1}`;
      params.push(documento);
    }

    if (fechaInicio && fechaFin) {
      query += ` AND a."fechaRegistro" BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(new Date(fechaInicio), new Date(fechaFin));
    }

    query += ` ORDER BY rank DESC, a."fechaRegistro" DESC`;

    const aliados = await prisma.$queryRawUnsafe(query, ...params);

    // ✅ Serializar fechas y agregar conteo
    const aliadosSerializados = (aliados as any[]).map((a) => ({
      ...a,
      fechaRegistro: a.fechaRegistro?.toISOString() || null,
      productos: Number(a.productosCount || 0), // ⬅️ PostgreSQL devuelve en minúsculas
    }));

    return response({
      data: aliadosSerializados,
      message: "Aliados listados correctamente",
    });
  } catch (e: any) {
    console.error("Error en /api/aliados:", e);
    return response({ error: e.message || "Error al listar aliados" }, 500);
  }
}

// POST /api/aliados → crea o reactiva aliado
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const body = await validateBody(req, aliadoSchema);
    if (body.documento) {
      body.documento = DOMPurify.sanitize(body.documento.trim());
    }
    if (body.telefono) body.telefono = body.telefono.trim();
    if (body.correo) body.correo = body.correo.trim();

    const existing = await prisma.aliado.findUnique({
      where: { documento: body.documento },
    });

    let result;
    if (existing && existing.deletedAt) {
      result = await prisma.aliado.update({
        where: { id: existing.id },
        data: { ...body, deletedAt: null, estado: "ACTIVO" },
      });

      await logHistorial({
        tipo: "ACTUALIZAR",
        accion: `Aliado ${result.nombre} reactivado`,
        entidad: "Aliado",
        entidadId: result.id,
        usuarioId: user.id,
        detalle: result,
        ip: req.headers.get("x-forwarded-for") || undefined,
      });

      return response(
        {
          data: {
            ...result,
            fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
          },
          message: "Aliado reactivado correctamente",
        },
        200
      );
    }

    if (existing) {
      return response({ error: "Documento ya registrado" }, 409);
    }

    result = await prisma.aliado.create({ data: body });

    await logHistorial({
      tipo: "CREAR",
      accion: `Aliado ${result.nombre} creado`,
      entidad: "Aliado",
      entidadId: result.id,
      usuarioId: user.id,
      detalle: result,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response(
      {
        data: {
          ...result,
          fechaRegistro: result.fechaRegistro.toISOString(), // ✅ Serializar
        },
        message: "Aliado creado correctamente",
      },
      201
    );
  } catch (e: any) {
    if (e.code === "VALIDATION") return response({ error: e.error }, 400);
    return response({ error: e.message || "Error al crear aliado" }, 500);
  }
}