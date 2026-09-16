import { defineConfig, globalIgnores } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const publicApi = 'index.{ts,tsx}';

const publicApiOf = (types) => ({
  to: {
    element: {
      types: {
        anyOf: types,
      },
      fileInternalPath: publicApi,
    },
  },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['app/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['app/**/*', 'src/**/*'],
      'boundaries/dependency-nodes': ['import', 'dynamic-import', 'export'],
      'boundaries/elements': [
        {
          type: 'next-router',
          pattern: 'app',
          partialMatch: false,
        },
        ...['app', 'views', 'widgets', 'features', 'entities', 'shared'].map((layer) => ({
          type: layer,
          pattern: `src/${layer}/*`,
          capture: ['slice'],
          partialMatch: false,
        })),
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message: 'FSD 의존성은 하위 레이어의 Public API(index.ts)를 통해서만 참조할 수 있습니다.',
          policies: [
            {
              from: { element: { type: 'next-router' } },
              allow: publicApiOf(['app', 'views', 'shared']),
            },
            {
              from: { element: { type: 'app' } },
              allow: publicApiOf(['views', 'widgets', 'features', 'entities', 'shared']),
            },
            {
              from: { element: { type: 'views' } },
              allow: publicApiOf(['widgets', 'features', 'entities', 'shared']),
            },
            {
              from: { element: { type: 'widgets' } },
              allow: publicApiOf(['features', 'entities', 'shared']),
            },
            {
              from: { element: { type: 'features' } },
              allow: publicApiOf(['entities', 'shared']),
            },
            {
              from: { element: { type: 'entities' } },
              allow: publicApiOf(['shared']),
            },
            {
              from: { element: { type: 'shared' } },
              allow: publicApiOf(['shared']),
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
