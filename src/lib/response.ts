// Helper unificado de respuestas
export function response(
  { data = null, message = null, error = null }: 
  { data?: any; message?: string | null; error?: string | null },
  status: number = 200
) {
  return new Response(
    JSON.stringify({ data, message, error }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
