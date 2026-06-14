import type { CodegenConfig } from "@graphql-codegen/cli";
import { graphqlServer } from "./src/helpers/const";

const config: CodegenConfig = {
  schema: graphqlServer,
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },
};

export default config;
