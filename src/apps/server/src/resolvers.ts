import { GraphQLError } from "graphql";
import {
  getAllManufacturers,
  nhtsaBaseUrl,
  nhtsaReportsUrl,
} from "./helpers/const.js";
import db from "./config/db.js";

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

export interface UserRow {
  user_id: string;
  email_address: string;
  favorite_manufactures?: string[];
}

interface GetMakeForManufacturerType {
  Make_ID: number;
  Make_Name: string;
  Mfr_Name: string;
}
interface RecallType {
  NHTSACampaignNumber: string;
  ReportReceivedDate?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
}

interface ComplaintType {
  odiNumber: number | string;
  dateOfIncident?: string;
  dateComplaintFiled?: string;
  components?: string;
  summary?: string;
  crash?: boolean | string;
  fire?: boolean | string;
  numberOfInjuries?: number | string;
  numberOfDeaths?: number | string;
}

interface SafetyRatingType {
  VehicleId: number;
  VehicleDescription: string;
  OverallRating?: string;
  OverallFrontCrashRating?: string;
  OverallSideCrashRating?: string;
  RolloverRating?: string;
}

// GET a NHTSA endpoint and return its JSON, or throw a GraphQL error
const fetchNhtsa = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    // The recalls API answers "no recalls" with a 400 and an empty result
    // body, so treat a 0-count body as a normal empty response
    const body = await response.json().catch(() => null);
    if (body && (body.Count === 0 || body.count === 0)) return body;

    throw new GraphQLError(`Failed to fetch from NHTSA (${response.status})`, {
      extensions: { code: "EXTERNAL_API_ERROR" },
    });
  }
  return response.json();
};

// NHTSA sends booleans and counts as strings in some responses
const toBool = (v: unknown) => v === true || v === "True" || v === "true";
const toInt = (v: unknown) => Number.parseInt(String(v ?? 0), 10) || 0;

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
    modelsForMakeYear: async (
      _: unknown,
      { make, year }: { make: string; year: number },
    ) => {
      const data = await fetchNhtsa(
        `${nhtsaBaseUrl}/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make.trim())}/modelyear/${year}?format=json`,
      );

      return data.Results.map((d: GetModelsForMakeIdType) => ({
        makeId: d.Make_ID,
        makeName: d.Make_Name,
        modelId: d.Model_ID,
        modelName: d.Model_Name,
        year,
      }));
    },
    vehicleReport: async (
      _: unknown,
      { make, model, year }: { make: string; model: string; year: number },
    ) => {
      const params = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
      const ratingsPath = `modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`;

      const [recalls, complaints, variants] = await Promise.all([
        fetchNhtsa(`${nhtsaReportsUrl}/recalls/recallsByVehicle?${params}`),
        fetchNhtsa(
          `${nhtsaReportsUrl}/complaints/complaintsByVehicle?${params}`,
        ),
        fetchNhtsa(`${nhtsaReportsUrl}/SafetyRatings/${ratingsPath}`),
      ]);

      // Each body style (e.g. 2-door, 4-door) has its own star ratings, which
      // need one more call per VehicleId. Motorcycles have none.
      const ratings = await Promise.all(
        (variants.Results ?? []).map(({ VehicleId }: { VehicleId: number }) =>
          fetchNhtsa(`${nhtsaReportsUrl}/SafetyRatings/VehicleId/${VehicleId}`),
        ),
      );

      return {
        make,
        model,
        year,
        recalls: (recalls.results ?? []).map((r: RecallType) => ({
          campaignNumber: r.NHTSACampaignNumber,
          reportDate: r.ReportReceivedDate,
          component: r.Component,
          summary: r.Summary,
          consequence: r.Consequence,
          remedy: r.Remedy,
        })),
        complaints: (complaints.results ?? []).map((c: ComplaintType) => ({
          odiNumber: String(c.odiNumber),
          dateOfIncident: c.dateOfIncident,
          dateFiled: c.dateComplaintFiled,
          component: c.components,
          summary: c.summary,
          crash: toBool(c.crash),
          fire: toBool(c.fire),
          injuries: toInt(c.numberOfInjuries),
          deaths: toInt(c.numberOfDeaths),
        })),
        safetyRatings: ratings
          .map((r) => r.Results?.[0] as SafetyRatingType | undefined)
          .filter((r): r is SafetyRatingType => !!r)
          .map((r) => ({
            vehicleId: r.VehicleId,
            description: r.VehicleDescription,
            overall: r.OverallRating,
            frontCrash: r.OverallFrontCrashRating,
            sideCrash: r.OverallSideCrashRating,
            rollover: r.RolloverRating,
          })),
      };
    },
    users: async (_: unknown, { clerkUserId }: { clerkUserId?: string }) => {
      console.log("%c⧭", "color: #364cd9", "users", { clerkUserId });
      // return [
      //   {
      //     mail_address: "urauf101@gmail.com",
      //     favorite_manufactures: ["474:HONDA MOTOR CO., LTD."],
      //   },
      // ];
      try {
        const result = clerkUserId
          ? await db.query<UserRow>(
              "SELECT email_address, favorite_manufactures FROM users WHERE clerk_user_id = $1",
              [clerkUserId],
            )
          : await db.query<UserRow>(
              "SELECT email_address, favorite_manufactures FROM users",
            );

        //DEBUGGING
        console.log("result", result.rows);

        return result.rows.map((row) => {
          return {
            ...row,
            favorite_manufactures: Array.isArray(row.favorite_manufactures)
              ? row.favorite_manufactures
              : [],
          };
        });
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
        clerkUserId,
        favoriteManufacturer,
      }: {
        clerkUserId: string;
        favoriteManufacturer: string[];
      },
    ) => {
      try {
        if (!clerkUserId || !favoriteManufacturer) {
          throw new GraphQLError(
            `Missing properties to make the update request. clerkUserId: ${clerkUserId} & favoriteManufacturer: ${favoriteManufacturer}`,
            {
              extensions: { code: "BAD_USER_INPUT" },
            },
          );
        }
        await db.query(
          `UPDATE users
           SET favorite_manufactures = $1::text[]
           WHERE clerk_user_id = $2;`,
          [favoriteManufacturer, clerkUserId], // the client sends the full list, so replace rather than append
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
