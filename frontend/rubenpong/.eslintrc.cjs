/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
  ],
  // rules: {
  //   indent: ["error", 2], // 2 spaces
  //   "no-unused-vars": "error",
  // },
  parserOptions: {
    ecmaVersion: "latest",
  },
};
