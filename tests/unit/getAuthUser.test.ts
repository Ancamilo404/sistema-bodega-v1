import { getAuthUser } from "@/lib/getAuthUser";

describe("getAuthUser helper", () => {
  it("debería devolver usuario si el header x-auth-user contiene JSON válido", () => {
    const userObj = { id: 123, rol: "ADMIN" };
    const req = new Request("http://localhost", {
      headers: { "x-auth-user": JSON.stringify(userObj) },
    });

    const user = awi getAuthUser(req);

    expect(user).toEqual(userObj);
  });

  it("debería devolver null si no hay header x-auth-user", () => {
    const req = new Request("http://localhost");
    const user = getAuthUser(req);

    expect(user).toBeNull();
  });

  it("debería devolver null si el header x-auth-user no es JSON válido", () => {
    const req = new Request("http://localhost", {
      headers: { "x-auth-user": "no-es-json" },
    });

    const user = getAuthUser(req);

    expect(user).toBeNull();
  });

  it("debería devolver null si el header existe pero está vacío", () => {
    const req = new Request("http://localhost", {
      headers: { "x-auth-user": "" },
    });

    const user = getAuthUser(req);

    expect(user).toBeNull();
  });

  it("debería aceptar también rol TRABAJADOR", () => {
    const userObj = { id: 456, rol: "TRABAJADOR" };
    const req = new Request("http://localhost", {
      headers: { "x-auth-user": JSON.stringify(userObj) },
    });

    const user = getAuthUser(req);

    expect(user).toEqual(userObj);
  });

  it("debería aceptar también rol USUARIO", () => {
    const userObj = { id: 789, rol: "USUARIO" };
    const req = new Request("http://localhost", {
      headers: { "x-auth-user": JSON.stringify(userObj) },
    });

    const user = getAuthUser(req);

    expect(user).toEqual(userObj);
  });
});
