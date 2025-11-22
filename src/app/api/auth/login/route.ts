import { prisma } from "@/lib/prisma";
import { response } from "@/lib/response";
import { signToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { logHistorial } from "@/lib/logHistorial";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function POST(req: Request) {
  try {
    const { correo, password } = await req.json();
    const correoNormalizado = correo.toLowerCase();

    const user = await prisma.usuario.findUnique({ where: { correo: correoNormalizado } });
    if (!user) return response({ error: "Credenciales inválidas" }, 401);
    if (user.estado === "BLOQUEADO") return response({ error: "Usuario bloqueado" }, 403);

    const valid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!valid) return response({ error: "Credenciales inválidas" }, 401);

    // 🚩 Firmar token con id y rol
    const token = await signToken({ id: user.id, rol: user.rol });
    console.log("TOKEN LOGIN:", token);

    await logHistorial({
      tipo: "LOGIN",
      accion: `Usuario ${user.id} inició sesión`,
      entidad: "Usuario",
      entidadId: user.id,
      usuarioId: user.id,
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    // ✅ Usar cookies() de forma asíncrona
    const cookieStore = await cookies();
    cookieStore.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hora
      sameSite: "lax",
    });

    return NextResponse.json({ message: "Login correcto" }, { status: 200 });
  } catch (e: any) {
    return response({ error: e.message || "Error en login" }, 500);
  }
}
