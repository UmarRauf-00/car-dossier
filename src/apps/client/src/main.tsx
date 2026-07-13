import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.tsx";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme.ts";
import { port } from "./helpers/const.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import GetDetailsByMakeID from "./components/searchTabs/GetDetailsByMakeID.tsx";
import { ClerkProvider } from "@clerk/react-router";

const client = new ApolloClient({
  link: new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    headers: {
      "content-type": "application/json",
    },
  }),
  cache: new InMemoryCache(),
});

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={publishableKey}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
              <Route path="/" element={<App />} />
              <Route
                path="/makeDetails/:makeId"
                element={<GetDetailsByMakeID />}
              />
            </Routes>
          </ThemeProvider>
        </ApolloProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
);
