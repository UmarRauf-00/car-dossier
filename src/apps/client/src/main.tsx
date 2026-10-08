import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./main.css";
import App from "./App.tsx";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme.ts";
import { graphqlServer } from "./helpers/const.ts";
import { BrowserRouter, Route, Routes } from "react-router";
import VehicleReport from "./components/vehicle/VehicleReport.tsx";
import { ClerkProvider } from "@clerk/react-router";
import Header from "./components/Header.tsx";

const client = new ApolloClient({
  link: new HttpLink({
    uri: graphqlServer,
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
            <Header />
            <Container
              maxWidth="lg"
              component="main"
              sx={{ py: { xs: 4, md: 7 } }}
            >
              <Routes>
                <Route path="/" element={<App />} />
                <Route
                  path="/vehicle/:make/:model/:year"
                  element={<VehicleReport />}
                />
              </Routes>
            </Container>
          </ThemeProvider>
        </ApolloProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
);
