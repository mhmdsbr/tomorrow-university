import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ignores: [
      "src/server/repos/**",
      "src/server/db/**",
      "scripts/**",
      "drizzle.config.*",
      "seed.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/server/db",
              message: "Import db only from src/server/repos; use a service instead.",
            },
            {
              name: "@/server/db/index",
              message: "Import db only from src/server/repos; use a service instead.",
            },
            {
              name: "@/server/db/index.ts",
              message: "Import db only from src/server/repos; use a service instead.",
            },
            {
              name: "@/server/db/index.tsx",
              message: "Import db only from src/server/repos; use a service instead.",
            },
            {
              name: "@/server/db/index.js",
              message: "Import db only from src/server/repos; use a service instead.",
            },
            {
              name: "@/server/db/index.mjs",
              message: "Import db only from src/server/repos; use a service instead.",
            },
          ],
          patterns: [
            {
              regex: "^(?:\\.\\.?/)+server/db(?:/index(?:\\.(?:ts|tsx|js|mjs))?)?$",
              message: "Import db only from src/server/repos; use a service instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/client/components/public/**",
      "src/client/components/common/**",
      "src/client/hooks/**",
      "src/client/utils/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/server/actions/*",
                "@/client/components/admin/*",
                "@/server/db",
                "@/server/db/**",
                "@/server/repos",
                "@/server/repos/**",
                "@/server/services",
                "@/server/services/**",
                "@/server/schemas",
                "@/server/schemas/**",
                "@/server/auth",
                "@/server/auth/**",
                "@/server/action-result",
                "@/server/email",
                "@/server/revalidate",
              ],
              message: "Public and common UI must not import admin actions or components.",
            },
            {
              regex: "^(?:\\.\\.?/)+server/(?:actions|db|repos|services|schemas|auth)(?:/|$)",
              message: "Public and shared UI must not import server or admin modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/client/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/server/db",
                "@/server/db/**",
                "@/server/repos",
                "@/server/repos/**",
                "@/server/services",
                "@/server/services/**",
                "@/server/schemas",
                "@/server/schemas/**",
                "@/server/auth",
                "@/server/auth/**",
                "@/server/action-result",
                "@/server/email",
                "@/server/revalidate",
              ],
              message: "Client code may only depend on server actions, not server internals.",
            },
            {
              regex: "^(?:\\.\\.?/)+server/(?:db|repos|services|schemas|auth)(?:/|$)",
              message: "Client code may only depend on server actions, not server internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/**", "@/client/**"],
              message: "Shared code must remain safe to import from either environment.",
            },
            {
              regex: "^(?:\\.\\.?/)+(?:server|client)(?:/|$)",
              message: "Shared code must remain safe to import from either environment.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/client/**"],
              message: "Server code must not depend on client modules.",
            },
            {
              regex: "^(?:\\.\\.?/)+client(?:/|$)",
              message: "Server code must not depend on client modules.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
