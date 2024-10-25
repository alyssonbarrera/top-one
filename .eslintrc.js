module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    '@rocketseat/eslint-config/node',
  ],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "no-useless-constructor": "off",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", ["internal", "unknown"], "parent", "sibling", "index"],
        "pathGroups": [
          {
            "pattern": "@nestjs/**",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/core/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/modules/**/use-cases/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "./controllers/**",
            "group": "internal",
            "position": "after"
          },
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
};
