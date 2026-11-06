import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Regras do React Compiler (react-hooks 7). O projeto não liga o
    // React Compiler, e os pontos apontados hoje (carrinho, checkout, admin)
    // pedem refatoração com teste próprio. Ficam como aviso até lá.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "05-build/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
