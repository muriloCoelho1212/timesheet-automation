import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sharedConfig from '@timesheet/eslint-config';

export default [
  // 1. Regras recomendadas do ESLint
  eslint.configs.recommended,

  // 2. Regras recomendadas do TypeScript
  ...tseslint.configs.recommended,

  // 3. Integração com o Prettier (evita conflitos de formatação)
  eslintPluginPrettierRecommended,

  // 4. Nossas regras customizadas (NestJS + Pacote Compartilhado)
  {
    rules: {
      ...sharedConfig.rules, // <-- Nossas regras globais entram aqui!

      // Regras específicas do NestJS que vieram de fábrica:
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // No Nest, geralmente queremos permitir o "any" em alguns casos de injeção de dependência:
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
