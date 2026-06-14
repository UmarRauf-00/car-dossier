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
export const resolvers = {
  Query: {
    allManufacturers: async () => {
      try {
        console.log(
          "%c%s",
          "color: #0088cc",
          "URL >>>>>>>>",
          nhtsaBaseUrl + getAllManufacturers,
        );
        const response = await fetch(nhtsaBaseUrl + getAllManufacturers);

        console.log("%c%s", "color: #e50000", "Resolver", {
          URL: response.url,
        });
        if (!response.ok) {
          throw new GraphQLError("Failed to fetch from NHTSA", {
            extensions: { code: "EXTERNAL_API_ERROR" },
          });
        }

        const data = await response.json();

        // console.log("%c⧭", "color: #aa00ff", {
        //   res: data.Results.map((res: AllManufacturersType) => res.Country),
        // });
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
    // car: (_: unknown, { id }: { id: string }) =>
    //   dummyCars.find((car) => car.id === id) ?? null,
  },
};
