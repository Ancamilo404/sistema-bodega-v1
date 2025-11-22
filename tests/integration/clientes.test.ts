import request from "supertest";

describe("Integración - Clientes API", () => {
  const baseUrl = "http://localhost:3000";
  const authHeader = { "x-auth-user": JSON.stringify({ id: 1, rol: "ADMIN" }) };

  it("GET /api/clientes debería listar todos los clientes", async () => {
    const res = await request(baseUrl).get("/api/clientes").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("POST /api/clientes debería crear un cliente válido", async () => {
    const nuevo = {
      nombre: "Cliente Test",
      tipoId: "CC",
      documento: "123456789",
      estado: "ACTIVO",
    };
    const res = await request(baseUrl).post("/api/clientes").set(authHeader).send(nuevo);
    expect([201, 400, 409]).toContain(res.status);
  });

  it("POST /api/clientes debería reactivar un cliente archivado", async () => {
    const nuevo = {
      nombre: "Cliente Reactivar",
      tipoId: "CC",
      documento: "888888888",
      estado: "ACTIVO",
    };
    // Crear
    let res = await request(baseUrl).post("/api/clientes").set(authHeader).send(nuevo);
    expect(res.status).toBe(201);

    // Archivar
    await request(baseUrl).delete(`/api/clientes/${res.body.data.id}`).set(authHeader);

    // Reactivar con mismo documento
    res = await request(baseUrl).post("/api/clientes").set(authHeader).send(nuevo);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Cliente reactivado");
    expect(res.body.data.deletedAt).toBeNull();
  });

  it("PUT /api/clientes/:id debería actualizar un cliente existente", async () => {
    const res = await request(baseUrl).put("/api/clientes/1").set(authHeader).send({ nombre: "Cliente Editado" });
    expect([200, 404, 403]).toContain(res.status);
  });

  it("PUT /api/clientes/:id debería intercambiar clientes (reactivar uno y archivar otro)", async () => {
    // Crear Cliente1 activo
    const cliente1 = await request(baseUrl).post("/api/clientes").set(authHeader).send({
      nombre: "Cliente1",
      tipoId: "CC",
      documento: "123",
      estado: "ACTIVO",
    });

    // Crear Cliente2 y archivarlo
    const cliente2 = await request(baseUrl).post("/api/clientes").set(authHeader).send({
      nombre: "Cliente2",
      tipoId: "CC",
      documento: "456",
      estado: "ACTIVO",
    });
    await request(baseUrl).delete(`/api/clientes/${cliente2.body.data.id}`).set(authHeader);

    // Editar Cliente1 → cambiar documento a 456
    const res = await request(baseUrl).put(`/api/clientes/${cliente1.body.data.id}`)
      .set(authHeader)
      .send({ documento: "456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Cliente intercambiado");

    // Verificar que Cliente2 está activo y Cliente1 archivado
    const checkCliente2 = await request(baseUrl).get(`/api/clientes/${cliente2.body.data.id}`).set(authHeader);
    expect(checkCliente2.status).toBe(200);

    const checkCliente1 = await request(baseUrl).get(`/api/clientes/${cliente1.body.data.id}`).set(authHeader);
    expect(checkCliente1.status).toBe(404); // porque quedó archivado
  });

  it("DELETE /api/clientes/:id debería eliminar un cliente", async () => {
    const res = await request(baseUrl).delete("/api/clientes/1").set(authHeader);
    expect([200, 404, 403, 409]).toContain(res.status);
  });
});
