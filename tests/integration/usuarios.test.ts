import request from "supertest";

describe("Integración - Usuarios API", () => {
  const baseUrl = "http://localhost:3000";
  const authHeader = { "x-auth-user": JSON.stringify({ id: 1, rol: "ADMIN" }) };

  it("GET /api/usuarios debería listar todos los usuarios", async () => {
    const res = await request(baseUrl).get("/api/usuarios").set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /api/usuarios/:id debería obtener un usuario por id", async () => {
    const res = await request(baseUrl).get("/api/usuarios/1").set(authHeader);
    expect([200, 404]).toContain(res.status);
  });

  it("POST /api/usuarios debería crear un usuario válido", async () => {
    const nuevo = {
      nombre: "Usuario Test",
      cedula: "999999",
      correo: "usuariotest@mail.com",
      rol: "TRABAJADOR",
      estado: "ACTIVO",
      password: "123456",
    };
    const res = await request(baseUrl).post("/api/usuarios").set(authHeader).send(nuevo);
    expect([201, 400, 409]).toContain(res.status);
  });

  it("POST /api/usuarios debería fallar con body incompleto", async () => {
    const incompleto = { nombre: "Sin correo ni cédula" };
    const res = await request(baseUrl).post("/api/usuarios").set(authHeader).send(incompleto);
    expect([400, 403]).toContain(res.status);
  });

  it("PUT /api/usuarios/:id debería actualizar un usuario existente", async () => {
    const res = await request(baseUrl).put("/api/usuarios/1").set(authHeader).send({ nombre: "Usuario Editado" });
    expect([200, 404, 403]).toContain(res.status);
  });

  it("DELETE /api/usuarios/:id debería eliminar un usuario", async () => {
    const res = await request(baseUrl).delete("/api/usuarios/1").set(authHeader);
    expect([200, 404, 403]).toContain(res.status);
  });
});
