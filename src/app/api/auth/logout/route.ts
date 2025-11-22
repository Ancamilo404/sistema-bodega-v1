  import { response } from "@/lib/response";
  import { getAuthUser } from "@/lib/getAuthUser";
  import { logHistorial } from "@/lib/logHistorial";
  import { NextResponse } from "next/server";
  import { cookies } from "next/headers";

  export async function POST(req: Request) {
    try {
      const user = await getAuthUser(req);

      if (user) {
        await logHistorial({
          tipo: "LOGOUT",
          accion: `Usuario ${user.id} cerró sesión`,
          entidad: "Usuario",
          entidadId: user.id,
          usuarioId: user.id,
          ip: req.headers.get("x-forwarded-for") || undefined,
        });
      }

      // ✅ Borrar cookie usando API oficial
      const cookieStore = await cookies();
      cookieStore.set("auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0, // expira inmediatamente
        sameSite: "strict",
      });

      return NextResponse.json({ message: "Logout correcto" }, { status: 200 });
    } catch (e: any) {
      return response({ error: e.message || "Error en logout" }, 500);
    }
  }
