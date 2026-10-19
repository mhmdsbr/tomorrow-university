import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DB_URL_PROD
    : process.env.DB_URL_LOCAL;

if (!dbUrl) {
  throw new Error(
    `Missing ${process.env.NODE_ENV === "production" ? "DB_URL_PROD" : "DB_URL_LOCAL"} environment variable.`,
  );
}

const pool = new Pool({ connectionString: dbUrl });

export const db = drizzle(pool, { schema });
export { milestones } from "./schema";
