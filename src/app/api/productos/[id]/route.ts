import { prisma } from '@/lib/prisma';
import { response } from '@/lib/response';
import { getAuthUser } from '@/lib/getAuthUser';
import { logHistorial } from '@/lib/logHistorial';
import { validateBody } from '@/lib/validateBody';
import { productoUpdateSchema } from '@/schemas/productoUpdate';

// GET /api/productos/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(params.id) },
      include: { aliado: true },
    });
    if (!producto) return response({ error: 'Producto no encontrado' }, 404);
    if (producto.deletedAt) return response({ error: 'Producto archivado' }, 404);

    // ⚡ Serializar campos numéricos y fechas
    const productoSerializado = {
      ...producto,
      precio: Number(producto.precio), // 👈 convertir Decimal a número
      creadoEn: producto.creadoEn.toISOString(),
      actualizadoEn: producto.actualizadoEn.toISOString(),
    };

    return response({ data: productoSerializado, message: 'Producto obtenido correctamente' });
  } catch (e: any) {
    return response({ error: e.message || 'Error al obtener producto' }, 500);
  }
}

// PUT /api/productos/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['ADMIN', 'TRABAJADOR'].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const body = await validateBody(req, productoUpdateSchema);

    // ⚡ Normalizar aliadoId vacío
    const data = {
      ...body,
      aliadoId: body.aliadoId ?? null,
    };

    const existing = await prisma.producto.findUnique({ where: { id: Number(params.id) } });
    if (!existing) return response({ error: 'Producto no encontrado' }, 404);
    if (existing.deletedAt) return response({ error: 'Producto archivado, no editable' }, 403);

    // ⚡ Verificar duplicados por nombre + aliadoId
    if (data.nombre && data.aliadoId !== undefined) {
      const conflict = await prisma.producto.findFirst({
        where: { nombre: data.nombre, aliadoId: data.aliadoId },
      });

      if (conflict && conflict.id !== Number(params.id)) {
        if (conflict.deletedAt) {
          // ✅ Reactivar producto archivado
          const reactivated = await prisma.producto.update({
            where: { id: conflict.id },
            data: { ...data, deletedAt: null, estado: 'ACTIVO' },
          });

          // ✅ Archivar el producto actual
          const old = await prisma.producto.update({
            where: { id: Number(params.id) },
            data: { deletedAt: new Date() },
          });

          await logHistorial({
            tipo: 'ACTUALIZAR',
            accion: `Producto ${reactivated.nombre} reactivado`,
            entidad: 'Producto',
            entidadId: reactivated.id,
            usuarioId: user.id,
            detalle: reactivated,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          await logHistorial({
            tipo: 'ELIMINAR',
            accion: `Producto ${old.nombre} archivado`,
            entidad: 'Producto',
            entidadId: old.id,
            usuarioId: user.id,
            detalle: old,
            ip: req.headers.get('x-forwarded-for') || undefined,
          });

          return response({
            data: reactivated,
            message: `Producto intercambiado: se reactivó ${reactivated.nombre} y se archivó ${old.nombre}`,
          });
        }

        return response({ error: 'Producto ya registrado para este aliado' }, 409);
      }
    }

    // ✅ Actualizar normalmente
    const updatedProducto = await prisma.producto.update({
      where: { id: Number(params.id) },
      data,
    });

    // ⚡ Serializar campos numéricos y fechas
    const productoSerializado = {
      ...updatedProducto,
      precio: Number(updatedProducto.precio),
      creadoEn: updatedProducto.creadoEn.toISOString(),
      actualizadoEn: updatedProducto.actualizadoEn.toISOString(),
    };

    await logHistorial({
      tipo: 'ACTUALIZAR',
      accion: `Producto ${productoSerializado.nombre} actualizado`,
      entidad: 'Producto',
      entidadId: productoSerializado.id,
      usuarioId: user.id,
      detalle: productoSerializado,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: productoSerializado, message: 'Producto actualizado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Producto no encontrado' }, 404);
    if (e.code === 'VALIDATION') return response({ error: e.error }, 400);
    return response({ error: e.message || 'Error al actualizar producto' }, 500);
  }
}


// DELETE /api/productos/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
        if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: 'No autorizado' }, 403);
    }

    const archived = await prisma.producto.update({
      where: { id: Number(params.id) },
      data: { deletedAt: new Date() },
    });

    await logHistorial({
      tipo: 'ELIMINAR',
      accion: `Producto ${archived.nombre} archivado`,
      entidad: 'Producto',
      entidadId: archived.id,
      usuarioId: user.id,
      detalle: archived,
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return response({ data: { id: archived.id }, message: 'Producto archivado correctamente' });
  } catch (e: any) {
    if (e.code === 'P2025') return response({ error: 'Producto no encontrado' }, 404);
    if (e.code === 'P2003')
      return response({ error: 'No se puede archivar: producto con ventas asociadas' }, 409);
    return response({ error: e.message || 'Error al archivar producto' }, 500);
  }
}
