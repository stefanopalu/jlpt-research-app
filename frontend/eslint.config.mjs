import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,  // Add Node globals for React Native
        __DEV__: "readonly"  // React Native specific global
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: "latest",
        sourceType: "module"
      }
    }
  },
  pluginReact.configs.flat.recommended,
  {
    // React Native specific rules
    rules: {
      // Allow console.log for React Native development
      "no-console": "off",
      
      // React specific adjustments
      "react/react-in-jsx-scope": "off", // Not needed in newer React/RN
      "react/prop-types": "off", // You're not using TypeScript/PropTypes
      
      // Consistent code style
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "indent": ["error", 2],
      "comma-dangle": ["error", "always-multiline"]
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
]);