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
      globals: globals.node
    },
    rules: {
      // Allow console.log for development/debugging
      "no-console": "off",
      
      // Require semicolons
      "semi": ["error", "always"],
      
      // Consistent quotes (single quotes)
      "quotes": ["error", "single"],
      
      // No unused variables (but allow unused function parameters with _)
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      
      // Consistent indentation (2 spaces)
      "indent": ["error", 2],
      
      // Require trailing commas (helps with git diffs)
      "comma-dangle": ["error", "always-multiline"],
      
      // No extra spaces
      "no-multi-spaces": "error",
      
      // Consistent object spacing
      "object-curly-spacing": ["error", "always"]
    }
  }
]);
