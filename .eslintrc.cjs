module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    // Production-grade rules - zero tolerance
    'no-console': 'warn', // Temporarily allow console during development
    'no-debugger': 'error',
    'no-alert': 'warn',
    
    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'warn', // Temporarily allow any during refactoring
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    
    // React rules
    'react/prop-types': 'off', // Using TypeScript
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    
    // Performance and best practices
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'error',
    'prefer-arrow-callback': 'warn',
    'no-loop-func': 'error',
    'no-await-in-loop': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 