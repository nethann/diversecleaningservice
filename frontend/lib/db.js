import { access, readFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";

let pool;
let initPromise;

async function resolveDatabaseFile(filename) {
  const candidatePaths = [
    path.join(process.cwd(), "database", filename),
    path.join(process.cwd(), "..", "database", filename)
  ];

  for (const candidate of candidatePaths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next likely location.
    }
  }

  return candidatePaths[0];
}

function getConnectionString() {
  const internalUrl = process.env.DATABASE_URL?.trim() ?? "";
  const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim() ?? "";

  if (internalUrl.includes("railway.internal") && publicUrl) {
    return publicUrl;
  }

  return internalUrl || publicUrl;
}

function getSslConfig() {
  const databaseUrl = getConnectionString();

  if (!databaseUrl || databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")) {
    return false;
  }

  return { rejectUnauthorized: false };
}

export function getPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("DATABASE_URL or DATABASE_PUBLIC_URL is not configured.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: getSslConfig()
    });
  }

  return pool;
}

export async function initDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      const schemaPath = await resolveDatabaseFile("schema.sql");
      const schemaSql = await readFile(schemaPath, "utf8");
      await getPool().query(schemaSql);
      const authSchemaPath = await resolveDatabaseFile("auth-schema.sql");
      try {
        const authSchemaSql = await readFile(authSchemaPath, "utf8");
        await getPool().query(authSchemaSql);
      } catch {
        // Auth schema is optional until authentication is configured.
      }
    })();
  }

  return initPromise;
}

export async function runSqlFile(filename) {
  await initDatabase();
  const filePath = await resolveDatabaseFile(filename);
  const sql = await readFile(filePath, "utf8");
  await getPool().query(sql);
}

export async function query(text, params = []) {
  await initDatabase();
  return getPool().query(text, params);
}
