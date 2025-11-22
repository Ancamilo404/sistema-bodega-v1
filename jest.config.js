require("dotenv").config();

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // para que funcione el alias "@/lib/..."
  },
  testMatch: ["**/tests/**/*.test.ts"],
};
