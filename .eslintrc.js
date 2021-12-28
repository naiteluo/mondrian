module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // note you must disable the base rule as it can report incorrect errors
    "lines-between-class-members": "off",
    "@typescript-eslint/lines-between-class-members": ["error"],
  },
};
