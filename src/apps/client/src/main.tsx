import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.tsx";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme.ts";
import { port } from "./helpers/const.tsx";

const client = new ApolloClient({
  link: new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    headers: {
      "content-type": "application/json",
    },
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* MUI's CSS reset — replaces what Vite added */}
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>,
);
