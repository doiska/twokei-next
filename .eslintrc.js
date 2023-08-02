module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'standard-with-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  plugins: [
    'eslint-plugin-import',
    'eslint-plugin-simple-import-sort',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  settings: {
    'import/ignore': ['drizzle-orm/pg-core'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
      'eslint-import-resolver-custom-alias': {
        alias: {
          '@': './src',
          'drizzle-orm/pg-core': './node_modules/drizzle-orm',
          'drizzle-orm/node-postgres': './node_modules/drizzle-orm',
        },
        extensions: ['.ts'],
      },
    },
  },
  rules: {
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^discord.js', '^@sapphire', '^shoukaku'],
          ['^drizzle-orm', '^@/db'],
          ['^@', '^\\.'],
        ],
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/comma-dangle': [2, 'always-multiline'],
    '@typescript-eslint/semi': [2, 'always'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/method-signature-style': ['off'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 1 }],
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'consistent'],
  },
};
