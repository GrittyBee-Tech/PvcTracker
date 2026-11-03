```javascript
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
    "node_modules/**",
  ]),

  {
    rules: {
      // Existing project rules
      "react-hooks/incompatible-library": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // Prevent dynamic code execution
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      // Prevent unsafe JavaScript patterns
      "no-new-wrappers": "error",
      "no-unsafe-finally": "error",
      "no-proto": "error",

      // Restrict dangerous Node.js imports
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "child_process",
              message: "Avoid child process execution unless explicitly reviewed.",
            },
            {
              name: "node:child_process",
              message: "Avoid child process execution unless explicitly reviewed.",
            },
            {
              name: "vm",
              message: "Avoid dynamic code execution.",
            },
            {
              name: "node:vm",
              message: "Avoid dynamic code execution.",
            },
          ],
        },
      ],

      // Restrict CommonJS imports of dangerous modules
      "no-restricted-modules": [
        "error",
        {
          paths: [
            "child_process",
            "node:child_process",
            "vm",
            "node:vm",
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
```