import "dotenv/config";
import { defineConfig } from "prisma/config";

const baseUrl = process.env["DATABASE_URL"] ?? ""
const authToken = process.env["TURSO_AUTH_TOKEN"]

// For remote libsql (Turso), append authToken as query param for Prisma CLI
const url = authToken && baseUrl.startsWith("libsql://")
  ? `${baseUrl}?authToken=${authToken}`
  : baseUrl

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
