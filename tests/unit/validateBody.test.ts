import { validateBody } from "@/lib/validateBody";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(1),
  edad: z.number().int().positive(),
});

describe("validateBody helper", () => {
  it("debería aceptar un body válido", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ nombre: "Andrés", edad: 30 }),
    });

    const result = await validateBody(req, schema);
    expect(result).toEqual({ nombre: "Andrés", edad: 30 });
  });

  it("debería lanzar error si falta un campo", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ nombre: "Andrés" }),
    });

    await expect(validateBody(req, schema)).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("debería lanzar error si un campo tiene tipo incorrecto", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ nombre: "Andrés", edad: "no-es-numero" }),
    });

    await expect(validateBody(req, schema)).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("debería rechazar body vacío", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    });

    await expect(validateBody(req, schema)).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("debería rechazar body con campos extra no definidos en el schema", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ nombre: "Andrés", edad: 30, extra: "campo" }),
    });

    // Por defecto Zod ignora extras, pero si quieres estrictitud:
    const strictSchema = schema.strict();

    await expect(validateBody(req, strictSchema)).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });
});
