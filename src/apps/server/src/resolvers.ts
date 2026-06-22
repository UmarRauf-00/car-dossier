import { GraphQLError } from "graphql";
import { getAllManufacturers, nhtsaBaseUrl } from "./helpers/const";

interface AllMakesResponseType {
  Make_ID: number;
  Make_Name: string;
}

export interface AllManufacturersType {
  Country: string;
  Mfr_CommonName: string;
  Mfr_ID: number;
  Mfr_Name: string;
  VehicleTypes: [
    {
      isPrimary: boolean;
      name: string;
    },
  ];
}

interface GetMakeForManufacturerType {
  Make_ID: number;
  Make_Name: string;
  Mfr_Name: string;
}
export const resolvers = {
  Query: {
    allManufacturers: async () => {
      try {
        const response = await fetch(nhtsaBaseUrl + getAllManufacturers);

        if (!response.ok) {
          throw new GraphQLError("Failed to fetch from NHTSA", {
            extensions: { code: "EXTERNAL_API_ERROR" },
          });
        }
        const data = await response.json();

        // return the data
        return data.Results.map(
          ({
            Country,
            Mfr_CommonName,
            Mfr_ID,
            Mfr_Name,
            VehicleTypes,
          }: AllManufacturersType) => ({
            id: Mfr_ID,
            country: Country,
            companyName: Mfr_CommonName,
            fullCompanyName: Mfr_Name,
            vehicleType: VehicleTypes,
          }),
        );
      } catch (error) {
        throw new GraphQLError(`Internal Server Error - ${error}`, {
          extensions: { code: "EXTERNAL_API_ERROR" },
        });
      }
    },
    getMakeForManufacturer: async (
      _: unknown,
      { searchTerm }: { searchTerm: string },
    ) => {
      console.log("resolver called", searchTerm);
      try {
        const response = await fetch(
          `${nhtsaBaseUrl}/vehicles/GetMakeForManufacturer/${searchTerm}?format=json`,
        );

        if (!response.ok) {
          throw new GraphQLError("Failed to fetch from NHTSA", {
            extensions: { code: "EXTERNAL_API_ERROR" },
          });
        }
        const data = await response.json();

        // console.log("searchTerm received:", searchTerm);
        // console.log("NHTSA response:", data);

        // Returning data mapped to a custom key names
        return data.Results.map(
          ({ Make_ID, Make_Name, Mfr_Name }: GetMakeForManufacturerType) => ({
            makeId: Make_ID,
            makeName: Make_Name,
            manufacturerName: Mfr_Name,
          }),
        );
      } catch (error) {
        throw new GraphQLError(`Internal Server Error - ${error}`, {
          extensions: { code: "EXTERNAL_API_ERROR" },
        });
      }
    },
  },
};
