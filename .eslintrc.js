module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    semi: ['warn', 'always'],
    curly: ['error', 'all'],
    'no-unreachable': false,
  },
};
