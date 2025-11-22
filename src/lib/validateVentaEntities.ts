import { prisma } from "@/lib/prisma";

export async function validateVentaEntities({
  usuarioId,
  clienteId,
  items,
}: {
  usuarioId: number;
  clienteId: number;
  items: { productoId: number; cantidad: number }[];
}) {
  // Validar usuario
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario || usuario.estado === "BLOQUEADO") {
    throw new Error("El usuario está bloqueado");
  }

  // Validar cliente
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente || cliente.estado === "BLOQUEADO") {
    throw new Error("El cliente está bloqueado o no existe");
  }

  // Validar productos
  for (const i of items) {
    const producto = await prisma.producto.findUnique({ where: { id: i.productoId } });
    if (!producto) throw new Error(`Producto ${i.productoId} no encontrado`);
    if (producto.estado === "BLOQUEADO") throw new Error(`Producto ${producto.nombre} bloqueado`);
    if (producto.stock < i.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`);
  }
}
