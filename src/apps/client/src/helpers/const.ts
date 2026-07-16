// Full URL of the server's GraphQL endpoint. Locally this points at
// localhost via VITE_SERVER_PORT; in deployed environments it should be
// set directly to the API's real host (client and server won't share a
// "localhost" outside of local dev).
export const graphqlServer =
  import.meta.env.VITE_GRAPHQL_URL ??
  `http://localhost:${import.meta.env.VITE_SERVER_PORT}/graphql`;
