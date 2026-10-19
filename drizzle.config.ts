import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const dbUrl = process.env.NODE_ENV === 'production'
  ? process.env.DB_URL_PROD
  : process.env.DB_URL_LOCAL

if (!dbUrl) {
  throw new Error(
    'Missing DB_URL_LOCAL or DB_URL_PROD — check your .env file or Vercel environment variables.'
  )
}

export default defineConfig({
  schema: 'src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
})