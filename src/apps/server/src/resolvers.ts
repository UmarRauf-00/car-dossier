import { GraphQLError } from "graphql";
import { getAllManufacturers, nhtsaBaseUrl } from "./helpers/const";
import db from "./config/db";

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

export interface GetModelsForMakeIdType {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

export interface Users {
  first_name: string;
  last_name: string;
  favorite_manufactures: string[];
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
    getModelsForMakeId: async (_: unknown, { makeId }: { makeId: string }) => {
      // console.log("%c⧭", "color: #f200e2", { makeId });
      try {
        const response = await fetch(
          `${nhtsaBaseUrl}/vehicles/GetModelsForMakeId/${makeId}?format=json`,
        );

        if (!response.ok) {
          throw new GraphQLError("Failed to fetch from NHTSA", {
            extensions: { code: "EXTERNAL_API_ERROR" },
          });
        }

        const data = await response.json();

        // console.log("%c⧭", "color: #1d5673", { data: data.Results });
        const resp = data.Results.map((d: GetModelsForMakeIdType) => ({
          makeId: d.Make_ID,
          modelId: d.Model_ID,
          makeName: d.Make_Name,
          modelName: d.Model_Name,
        }));
        return resp;
      } catch (error) {
        throw new GraphQLError(`Internal Server Error - ${error}`, {
          extensions: { code: "EXTERNAL_API_ERROR" },
        });
      }
    },
    users: async (_: unknown, { userId }: { userId?: string }) => {
      try {
        const result = userId
          ? await db.query("SELECT * FROM users WHERE user_id = $1", [userId])
          : await db.query("SELECT * FROM users");
        return result.rows;
      } catch (error) {
        throw new GraphQLError(`Internal Server Error - ${error}`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    // combinedEndPointBFFPattern: async (_: unknown, { userId }: { userId?: string }) => {
    //   try {
    //     const [makesResponse, usersResult] = await Promise.all([
    //       fetch(`${nhtsaBaseUrl}/vehicles/GetAllMakes?format=json`),
    //       userId
    //         ? db.query("SELECT * FROM users WHERE user_id = $1", [userId])
    //         : db.query("SELECT * FROM users"),
    //     ]);

    //     const makeData = await makesResponse.json();
    //     const userData = usersResult.rows;

    //     // filter makes down to ones users have favorited
    //     const favoriteMakeNames = userData.flatMap(
    //       (u: Users) => u.favorite_manufactures,
    //     );
    //     const filteredMakes = makeData.Results.filter(
    //       (m: { Make_Name: string }) => favoriteMakeNames.includes(m.Make_Name),
    //     );

    //     return {
    //       vehicleData: filteredMakes,
    //       userData,
    //     };
    //   } catch (error) {
    //     throw new GraphQLError(`Internal Server Error - ${error}`, {
    //       extensions: { code: "EXTERNAL_API_ERROR" },
    //     });
    //   }
    // },
  },
  Mutation: {
    updateUserFavorites: async (
      _: unknown,
      {
        userId,
        favoriteManufacturer,
      }: {
        userId: number;
        favoriteManufacturer: string[];
      },
    ) => {
      console.log(
        "%c%s",
        "color: #7f7700",
        "MUTATION FUNC CALLED",
        userId,
        favoriteManufacturer,
      );
      try {
        if (!userId || !favoriteManufacturer) {
          throw new GraphQLError(
            `Missing properties to make the update request. userId: ${userId} & favoriteManufacturer: ${favoriteManufacturer}`,
            {
              extensions: { code: "BAD_USER_INPUT" },
            },
          );
        }
        await db.query(
          `UPDATE users
           SET  favorite_manufactures = $1
           WHERE user_id = $2;`,
          [favoriteManufacturer, userId],
        );
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) throw error; // rethrow as-is
        throw new GraphQLError(`Internal Server Error - ${error}`, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
