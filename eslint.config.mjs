import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The UI is French; apostrophes in copy are everywhere and reading cleaner
      // than HTML entities. (i18n is not used in this project.)
      "react/no-unescaped-entities": "off",
    },
  },
  // The dedicated use-table-instance wrapper is intentionally built around
  // an incompatible third-party hook (@tanstack/react-table). It uses
  // 'use no memo' to opt out of React Compiler — the warning is redundant.
  {
    files: ["lib/use-table-instance.ts"],
    rules: {
      "react-hooks/incompatible-library": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // shadcn/ui generated files — not meant to be edited or linted
    "components/ui/**",
    "hooks/use-mobile.ts",
  ]),
]);

export default eslintConfig;
