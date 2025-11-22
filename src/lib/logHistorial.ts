import { prisma } from "@/lib/prisma";
import type { TipoAccion } from "@/types/historial";

export async function logHistorial({
  tipo,
  accion,
  entidad,
  entidadId,
  usuarioId,
  detalle,
  ip,
}: {
  tipo: TipoAccion;
  accion: string;
  entidad?: string;
  entidadId?: number;
  usuarioId: number;
  detalle?: any;
  ip?: string;
}) {
  return prisma.historial.create({
    data: {
      tipo,
      accion,
      entidad,
      entidadId,
      usuarioId,
      ip,
      detalle:
        detalle === undefined || detalle === null
          ? undefined
          : typeof detalle === "string"
          ? detalle
          : JSON.stringify(detalle),
    },
  });
}
