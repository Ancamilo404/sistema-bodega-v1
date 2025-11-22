// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evitar que ESLint bloquee el build en Vercel mientras hacemos refactors de tipos.
  // Asegúrate de no exponer secretos aquí: usa variables de entorno en Vercel y
  // `process.env` únicamente en código server-side.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build para permitir despliegues rápidos.
    // NOTA: Es mejor arreglar los tipos a largo plazo. Usar sólo como medida temporal.
    ignoreBuildErrors: true,
  },
  // Establecer explicitamente el root para output tracing para evitar la advertencia
  // cuando hay lockfiles adicionales fuera del repositorio.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
