import { signToken, verifyToken } from "./auth";

const token = signToken({ id: 1, rol: "ADMIN" });
console.log("TOKEN:", token);

const user = verifyToken(token);
console.log("USER:", user);
