import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Turn off TanStack Table / React Compiler compatibility warnings globally
      "react-hooks/incompatible-library": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn"
      
      // If you also want to turn off the explicit 'any' rule globally later, you would add it here:
      // "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);

export default eslintConfig;