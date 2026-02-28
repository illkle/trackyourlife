// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      "react/no-children-prop": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          //project: ["./tsconfig.json", "../../tooling/typescript/base.json"],
        },
      },
    },
  },
]);
