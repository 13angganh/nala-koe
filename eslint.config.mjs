// ESLint v9 flat config.
// reason: eslint-config-next@16 ships a native flat-config array (no FlatCompat
// bridge needed). Custom rules below are a 1:1 port from the legacy
// .eslintrc.json so behavior is unchanged — only the config format changed.
import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'public/sw.js', 'coverage/**'],
  },
];

export default config;
