type DatabaseUrlPurpose = "app" | "migrations";

/**
 * On Vercel, the Neon integration injects DATABASE_URL (pooled) and
 * DATABASE_URL_UNPOOLED (direct, needed by migrations). Elsewhere, the
 * DB_URL_PROD / DB_URL_LOCAL variables are chosen by NODE_ENV.
 */
export function resolveDatabaseUrl(purpose: DatabaseUrlPurpose) {
  if (process.env.VERCEL) {
    const name =
      purpose === "migrations" ? "DATABASE_URL_UNPOOLED" : "DATABASE_URL";
    return { name, url: process.env[name] };
  }
  const name =
    process.env.NODE_ENV === "production" ? "DB_URL_PROD" : "DB_URL_LOCAL";
  return { name, url: process.env[name] };
}

export function isNeonUrl(url: string) {
  return new URL(url).hostname.endsWith(".neon.tech");
}
