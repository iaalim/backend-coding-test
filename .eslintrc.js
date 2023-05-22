module.exports = {
    root: true,
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:prettier/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2021,
    },
    rules: {
      // Possible Errors
      'no-console': 'warn',
      'no-debugger': 'warn',
  
      // Best Practices
      'eqeqeq': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'warn',
  
      // Stylistic Issues
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  };
