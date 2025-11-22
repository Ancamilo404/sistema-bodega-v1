import jwt from "jsonwebtoken";

const SECRET = "1234"; // el mismo que en auth.ts
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiQURNSU4iLCJpYXQiOjE3NjIyNjU1NDYsImV4cCI6MTc2MjI2OTE0Nn0.dRccdr5WKzx0Rb-v7Q6IQ58vVTPAMYe5UQK8dVx9Uys".trim();


try {
  const decoded = jwt.verify(token, SECRET);
  console.log("Decoded:", decoded);
} catch (e) {
  console.error("Error verificando token:", e);
}
