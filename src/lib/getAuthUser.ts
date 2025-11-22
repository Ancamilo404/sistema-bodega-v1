// src/lib/getAuthUser.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getAuthUser(req: Request) {
  try {
    // ✅ Leer cookie "auth"
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return null;

    // ✅ Verificar token con jose
    const payload = await verifyToken(token);
    if (!payload) return null;

    // ✅ Retornar usuario con id y rol
    return { id: payload.id, rol: payload.rol };
  } catch {
    return null;
  }
}
