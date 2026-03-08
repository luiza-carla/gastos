import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },

  configPrettier,
]);
