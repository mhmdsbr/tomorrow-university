import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { isNeonUrl, resolveDatabaseUrl } from "./url";

const { name, url } = resolveDatabaseUrl("app");

if (!url) {
  throw new Error(`Missing ${name} environment variable.`);
}

// Neon's HTTP driver avoids holding TCP connections open in serverless functions.
export const db = isNeonUrl(url)
  ? drizzleNeon({ client: neon(url), schema })
  : drizzlePg({ client: new Pool({ connectionString: url }), schema });

export { milestones } from "./schema";
