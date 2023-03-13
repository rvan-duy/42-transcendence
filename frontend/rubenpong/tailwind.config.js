/* eslint-env node */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/**/*.{js,jsx,ts,tsx,vue}',
    './src/**/*.{js,jsx,ts,tsx,vue}',
    './src/**/**/**/*.{js,jsx,ts,tsx,vue}',

  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
// when changing something here make sure to run this command after:
// npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
