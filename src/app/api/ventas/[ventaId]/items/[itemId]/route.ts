import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { logHistorial } from "@/lib/logHistorial";
import { validateBody } from "@/lib/validateBody";
import { ventaProductoUpdateSchema } from "@/schemas/ventaProductoUpdate";

// PUT /api/ventas/:ventaId/items/:itemId
export async function PUT(req: Request, { params }: { params: { ventaId: string; itemId: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    const body = await validateBody(req, ventaProductoUpdateSchema);

    // Buscar ítem existente
    const existing = await prisma.ventaProducto.findUnique({
      where: { id: Number(params.itemId) },
      include: { producto: true, venta: true },
    });
    if (!existing) return response({ error: "Ítem no encontrado" }, 404);

    // Bloquear edición si ya está anulado
    if (existing.cantidad === 0 && existing.subtotal === 0) {
      return response({ error: "Ítem anulado, no editable" }, 403);
    }

    // Actualizar ítem
    const updated = await prisma.ventaProducto.update({
      where: { id: Number(params.itemId) },
      data: body,
      include: { producto: true, venta: true },
    });

    await logHistorial({
      tipo: "ACTUALIZAR",
      accion: `Ítem de venta #${updated.id} actualizado`,
      entidad: "VentaProducto",
      entidadId: updated.id,
      usuarioId: user.id,
      detalle: updated,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: updated, message: "Ítem de venta actualizado correctamente" });
  } catch (e: any) {
    if (e.code === "P2025") return response({ error: "Ítem no encontrado" }, 404);
    if (e.code === "VALIDATION") return response({ error: e.error }, 400);
    return response({ error: e.message || "Error al actualizar ítem de venta" }, 500);
  }
}
// DELETE /api/ventas/:ventaId/items/:itemId → alias de anulación
export async function DELETE(req: Request, { params }: { params: { ventaId: string; itemId: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "TRABAJADOR"].includes(user.rol)) {
      return response({ error: "No autorizado" }, 403);
    }

    // Buscar ítem
    const existing = await prisma.ventaProducto.findUnique({
      where: { id: Number(params.itemId) },
      include: { producto: true, venta: true },
    });
    if (!existing) return response({ error: "Ítem no encontrado" }, 404);

    // En vez de borrar físicamente, lo marcamos como anulado
    const anulada = await prisma.ventaProducto.update({
      where: { id: Number(params.itemId) },
      data: { observaciones: (existing.observaciones ?? "") + " | Ítem anulado", cantidad: 0, subtotal: 0 },
      include: { producto: true, venta: true },
    });

    // Recalcular total de la venta
    const items = await prisma.ventaProducto.findMany({ where: { ventaId: Number(params.ventaId) } });
    const total = items.reduce((acc, i) => acc + Number(i.subtotal), 0);
    await prisma.venta.update({
      where: { id: Number(params.ventaId) },
      data: { total },
    });

    // Registrar en historial
    await logHistorial({
      tipo: "ACTUALIZAR",
      accion: `Ítem de venta #${anulada.id} anulado`,
      entidad: "VentaProducto",
      entidadId: anulada.id,
      usuarioId: user.id,
      detalle: anulada,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return response({ data: { id: anulada.id }, message: "Ítem de venta anulado correctamente" });
  } catch (e: any) {
    if (e.code === "P2025") return response({ error: "Ítem no encontrado" }, 404);
    return response({ error: e.message || "Error al anular ítem de venta" }, 500);
  }
}
