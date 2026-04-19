import nextConfig from "eslint-config-next/core-web-vitals";

const tsPlugin = nextConfig.find((c) => c.name === "next/typescript")?.plugins?.["@typescript-eslint"];

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**"] },
  ...nextConfig,
  {
    plugins: tsPlugin ? { "@typescript-eslint": tsPlugin } : {},
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
