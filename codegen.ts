import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3001/graphql',
  
  generates: {
    'packages/shared-types/src/index.ts': {
      plugins: [
        'typescript',
        'typescript-operations'
      ],
      config: {
        avoidOptionals: true,
        strictScalars: true,
      },
    },
  },
};

export default config;