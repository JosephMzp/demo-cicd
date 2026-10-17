// ESLint 9, configuración plana. Node para la API y las pruebas, navegador para el frontend.
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  { rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },   // los middlewares de Express necesitan 4 argumentos
  { ignores: ["node_modules/", "api/node_modules/", "coverage/"] },
  {
    files: ["api/**/*.js", "tests/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.node },
  },
  {
    files: ["web/public/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: globals.browser },
  },
];
