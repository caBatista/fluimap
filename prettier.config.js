/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx", "cva", "classnames"], // opcional
  tailwindAttributes: ["class", "className"],       // opcional
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "es5",
  bracketSpacing: true
};