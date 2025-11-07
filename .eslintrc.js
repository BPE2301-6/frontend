module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  rules: {
    // React правила
    'react/react-in-jsx-scope': 'off', // React 17+ не требует импорта React
    'react/prop-types': 'off', // Отключаем prop-types для JSX проектов
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',

    // Prettier правила
    'prettier/prettier': 'error',

    // Общие правила
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    '*.config.mjs',
    'yarn.lock',
    'package-lock.json',
    '.env*',
    'coverage/',
  ],
};
