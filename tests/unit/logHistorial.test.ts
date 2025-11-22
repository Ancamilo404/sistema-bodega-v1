import { logHistorial } from "@/lib/logHistorial";
import { prisma } from "@/lib/prisma";

describe("logHistorial helper", () => {
  it("debería registrar una acción en historial", async () => {
    const result = await logHistorial({
      tipo: "CREAR",
      accion: "Test acción",
      entidad: "Usuario",
      entidadId: 1,
      usuarioId: 1,
    });

    expect(result).toHaveProperty("id");
    expect(result.accion).toBe("Test acción");
    expect(result.tipo).toBe("CREAR");
  });

  it("debería serializar detalle si es un objeto", async () => {
    const detalle = { campo: "valor" };

    const result = await logHistorial({
      tipo: "ACTUALIZAR",
      accion: "Test con detalle",
      entidad: "Producto",
      entidadId: 2,
      usuarioId: 1,
      detalle,
    });

    expect(typeof result.detalle).toBe("string");
    expect(result.detalle).toContain("campo");
  });
});
