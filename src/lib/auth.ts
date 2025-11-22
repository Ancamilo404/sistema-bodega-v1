import { SignJWT, jwtVerify } from "jose";

// ⚠️ Usa siempre la variable de entorno en producción
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "1234");

// 👉 Firmar un token
export async function signToken(payload: { id: number; rol: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

// 👉 Verificar un token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: number; rol: string; iat: number; exp: number };
  } catch {
    return null;
  }
}
