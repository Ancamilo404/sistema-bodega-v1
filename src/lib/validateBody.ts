// src/lib/validateBody.ts
import { ZodSchema } from "zod";
import { response } from "@/lib/response";
import { Errors } from "@/lib/errors";

export async function validateBody<T>(req: Request, schema: ZodSchema<T>) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw { ...Errors.EntradaInvalida(details), code: "VALIDATION" };
  }
  return parsed.data;
}
