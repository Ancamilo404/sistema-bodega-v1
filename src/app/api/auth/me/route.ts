// src/app/api/auth/me/route.ts
import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { getAuthUser } from "@/lib/getAuthUser";
import { validateBody } from "@/lib/validateBody";
import { usuarioUpdateSchema } from "@/schemas/usuarioUpdate";
import bcrypt from "bcryptjs"; // para hashear contraseña


export async function GET(req: Request) {
  try {
    // ✅ Obtener usuario desde la cookie auth
    const user = await getAuthUser(req);
    if (!user) return response({ error: "No autenticado" }, 401);

    // ✅ Buscar datos completos en la BD
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, nombre: true, correo: true, rol: true },
    });

    if (!usuario) return response({ error: "Usuario no encontrado" }, 404);

    return response({ data: usuario, message: "Usuario autenticado" });
  } catch (e: any) {
    return response({ error: e.message || "Error al obtener usuario" }, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return response({ error: "No autenticado" }, 401);

    // ✅ Validar body contra schema
    const body = await validateBody(req, usuarioUpdateSchema);

    const dataToUpdate: any = {};
    if (body.nombre) dataToUpdate.nombre = body.nombre;
    if (body.correo) dataToUpdate.correo = body.correo;
    if (body.telefono) dataToUpdate.telefono = body.telefono;
    if (body.password) {
      const hashed = await bcrypt.hash(body.password, 10);
      dataToUpdate.password = hashed;
    }

    const usuario = await prisma.usuario.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: { id: true, nombre: true, correo: true, rol: true },
    });

    return response({ data: usuario, message: "Perfil actualizado" });
  } catch (e: any) {
    return response({ error: e.message || "Error al actualizar perfil" }, 500);
  }
}
