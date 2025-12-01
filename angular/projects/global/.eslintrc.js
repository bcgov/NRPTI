module.exports = {
  root: true,
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["projects/global/tsconfig.lib.json"]
      },
      plugins: ["@typescript-eslint", "@angular-eslint"],
      extends: ["plugin:@angular-eslint/recommended"],
      rules: {
        "@angular-eslint/directive-selector": [
          "error",
          { type: "attribute", prefix: "lib", style: "camelCase" }
        ],
        "@angular-eslint/component-selector": [
          "error",
          { type: "element", prefix: "lib", style: "kebab-case" }
        ]
      }
    }
  ]
};
