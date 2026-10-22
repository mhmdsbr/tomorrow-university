import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { resolveDatabaseUrl } from './src/server/db/url'

const { name, url } = resolveDatabaseUrl('migrations')

if (!url) {
  throw new Error(
    `Missing ${name} — check your .env file or Vercel environment variables.`
  )
}

export default defineConfig({
  schema: 'src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
  verbose: true,
  strict: true,
})
