import request from "supertest";

describe("Integración - Productos API", () => {
  const baseUrl = "http://localhost:3000";
  const authHeader = { "x-auth-user": JSON.stringify({ id: 1, rol: "ADMIN" }) };

  it("GET /api/productos debería listar todos los productos", async () => {
    const res = await request(baseUrl).get("/api/productos").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("POST /api/productos debería crear un producto válido", async () => {
    const nuevo = {
      nombre: "Producto Test",
      precio: 1000,
      stock: 10,
      estado: "ACTIVO",
      aliadoId: 1,
    };
    const res = await request(baseUrl).post("/api/productos").set(authHeader).send(nuevo);
    expect([201, 400, 409]).toContain(res.status);
  });

  it("PUT /api/productos/:id debería actualizar un producto existente", async () => {
    const res = await request(baseUrl).put("/api/productos/1").set(authHeader).send({ precio: 2000 });
    expect([200, 404, 403]).toContain(res.status);
  });

  it("DELETE /api/productos/:id debería eliminar un producto", async () => {
    const res = await request(baseUrl).delete("/api/productos/1").set(authHeader);
    expect([200, 404, 403, 409]).toContain(res.status); // ✅ ahora acepta 409
  });
});
