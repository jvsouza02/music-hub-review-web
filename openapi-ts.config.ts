import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/openapi.json",
  output: {
    path: "./src/lib/api/generated",
    postProcess: ["prettier"],
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/lib/api/generated-runtime.ts",
    },
    "@hey-api/typescript",
    {
      name: "@hey-api/sdk",
      auth: true,
      operations: {
        strategy: "flat",
      },
      paramsStructure: "grouped",
      responseStyle: "fields",
    },
  ],
});