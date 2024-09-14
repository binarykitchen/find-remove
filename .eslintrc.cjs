// @ts-check

const PROJECTS = ["./tsconfig.json"];

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    project: PROJECTS,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "import"],
  env: {
    es2022: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // Turns on errors for missing imports which is great
    "import/no-unresolved": "error",
  },
};
