// Local port
export const port = 4000;

// local
export const graphqlServer = `localhost:${port}/graphq`;
// NHTSA API
export const nhtsaBaseUrl = "https://vpic.nhtsa.dot.gov/api";
export const getAllMakes = "/vehicles/GetAllMakes?format=csv";
export const getAllManufacturers =
  "/vehicles/getallmanufacturers?format=json&page=2";
