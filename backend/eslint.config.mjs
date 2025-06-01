import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  {
    files: ["**/*.js"],
    languageOptions: { 
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        // Add Jest globals for test files
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "indent": ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "no-multi-spaces": "error",
      "object-curly-spacing": ["error", "always"]
    }
  }
]);