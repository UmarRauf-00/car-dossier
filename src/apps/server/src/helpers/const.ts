import "dotenv/config";

// Render (and most PaaS hosts) inject PORT and expect the app to bind to
// it; SERVER_PORT is our own local-dev-friendly override.
export const port = process.env.PORT ?? process.env.SERVER_PORT;

// The deployed client's origin, for CORS. Defaults to Vite's local dev
// server so nothing changes for local dev unless CLIENT_ORIGIN is set.
export const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

// NHTSA API
export const nhtsaBaseUrl = "https://vpic.nhtsa.dot.gov/api";
export const getAllMakes = "/vehicles/GetAllMakes?format=csv";
export const getAllManufacturers =
  "/vehicles/getallmanufacturers?format=json&page=2";
