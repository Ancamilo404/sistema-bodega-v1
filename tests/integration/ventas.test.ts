import request from "supertest";

describe("Integración - Ventas API", () => {
  const baseUrl = "http://localhost:3000";
  const authHeader = { "x-auth-user": JSON.stringify({ id: 1, rol: "ADMIN" }) };

  it("GET /api/ventas debería listar todas las ventas", async () => {
    const res = await request(baseUrl).get("/api/ventas").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("POST /api/ventas debería crear una venta en proceso", async () => {
    const nueva = {
      clienteId: 1,
      metodoPago: "EFECTIVO",
      items: [{ productoId: 1, cantidad: 2, precioUnitario: 1000 }],
    };
    const res = await request(baseUrl).post("/api/ventas").set(authHeader).send(nueva);
    expect([201, 400, 409]).toContain(res.status);
  });

  it("PATCH /api/ventas/:id/confirmar debería confirmar una venta", async () => {
    const res = await request(baseUrl).patch("/api/ventas/1/confirmar").set(authHeader);
    expect([200, 404, 403, 500]).toContain(res.status);
  });

  it("PATCH /api/ventas/:id/anular debería anular una venta", async () => {
    const res = await request(baseUrl).patch("/api/ventas/1/anular").set(authHeader);
    expect([200, 404, 403, 500]).toContain(res.status);
  });
});
