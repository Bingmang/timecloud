module.exports = {
  rules: {
    semi: [2, 'never'],
    'no-undef': [2],
    'no-tabs': 2,
    'comma-dangle': ['error', 'always-multiline'],
    'max-len': ['error', {
      code: 80,
      ignoreComments: true,
    }],
    'max-depth': ['error', 4],
    'max-params': ['error', 4],
    quotes: ['error', 'single'],
    'no-implicit-globals': 'error',
  },
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
};
