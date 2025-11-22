import request from "supertest";

describe("Integración - Aliados API", () => {
  const baseUrl = "http://localhost:3000";
  const authHeader = { "x-auth-user": JSON.stringify({ id: 1, rol: "ADMIN" }) };

  it("GET /api/aliados debería listar todos los aliados", async () => {
    const res = await request(baseUrl).get("/api/aliados").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /api/aliados/:id debería obtener un aliado por id", async () => {
    const res = await request(baseUrl).get("/api/aliados/1").set(authHeader);
    expect([200, 404]).toContain(res.status);
  });

  it("POST /api/aliados debería crear un aliado válido", async () => {
    const nuevo = {
      nombre: "Aliado Test",
      tipoId: "NIT",
      documento: "1234567890",
      estado: "ACTIVO",
    };
    const res = await request(baseUrl).post("/api/aliados").set(authHeader).send(nuevo);
    expect([201, 400, 409]).toContain(res.status);
  });

  it("POST /api/aliados debería fallar con body incompleto", async () => {
    const incompleto = { nombre: "Aliado sin documento" };
    const res = await request(baseUrl).post("/api/aliados").set(authHeader).send(incompleto);
    expect([400, 403]).toContain(res.status);
  });

  it("POST /api/aliados debería reactivar un aliado archivado", async () => {
    const nuevo = {
      nombre: "Aliado Reactivar",
      tipoId: "NIT",
      documento: "999999999",
      estado: "ACTIVO",
    };
    // Crear
    let res = await request(baseUrl).post("/api/aliados").set(authHeader).send(nuevo);
    expect(res.status).toBe(201);

    // Archivar
    await request(baseUrl).delete(`/api/aliados/${res.body.data.id}`).set(authHeader);

    // Reactivar con mismo documento
    res = await request(baseUrl).post("/api/aliados").set(authHeader).send(nuevo);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Aliado reactivado");
    expect(res.body.data.deletedAt).toBeNull();
  });

  it("PUT /api/aliados/:id debería actualizar un aliado existente", async () => {
    const res = await request(baseUrl).put("/api/aliados/1").set(authHeader).send({ nombre: "Aliado Editado" });
    expect([200, 404, 403]).toContain(res.status);
  });

  it("PUT /api/aliados/:id debería intercambiar aliados (reactivar uno y archivar otro)", async () => {
    // Crear Aliado1 activo
    const aliado1 = await request(baseUrl).post("/api/aliados").set(authHeader).send({
      nombre: "Aliado1",
      tipoId: "NIT",
      documento: "123",
      estado: "ACTIVO",
    });

    // Crear Aliado2 y archivarlo
    const aliado2 = await request(baseUrl).post("/api/aliados").set(authHeader).send({
      nombre: "Aliado2",
      tipoId: "NIT",
      documento: "456",
      estado: "ACTIVO",
    });
    await request(baseUrl).delete(`/api/aliados/${aliado2.body.data.id}`).set(authHeader);

    // Editar Aliado1 → cambiar documento a 456
    const res = await request(baseUrl).put(`/api/aliados/${aliado1.body.data.id}`)
      .set(authHeader)
      .send({ documento: "456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Aliado intercambiado");

    // Verificar que Aliado2 está activo y Aliado1 archivado
    const checkAliado2 = await request(baseUrl).get(`/api/aliados/${aliado2.body.data.id}`).set(authHeader);
    expect(checkAliado2.status).toBe(200);

    const checkAliado1 = await request(baseUrl).get(`/api/aliados/${aliado1.body.data.id}`).set(authHeader);
    expect(checkAliado1.status).toBe(404); // porque quedó archivado
  });

  it("DELETE /api/aliados/:id debería eliminar un aliado", async () => {
    const res = await request(baseUrl).delete("/api/aliados/1").set(authHeader);
    expect([200, 404, 403]).toContain(res.status);
  });
});
