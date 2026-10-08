export const typeDefs = `#graphql
  type vehicleType {
        isPrimary: Boolean
        name: String
      }
  
  type AllManufacturers {
    id: ID!
    companyName: String
    country: String!
    fullCompanyName: String!
    vehicleType: [vehicleType]
  }

  type GetMakeForManufacturer {
    makeId: Int!
    makeName: String!
    manufacturerName: String!
  }

  type GetModelsForMakeId {
    makeId: Int!,
    modelId: Int!,
    makeName: String!,
    modelName: String!,
  }

  type ModelForMakeYear {
    makeId: Int!
    makeName: String!
    modelId: Int!
    modelName: String!
    year: Int!
  }

  type Recall {
    campaignNumber: String!
    reportDate: String
    component: String
    summary: String
    consequence: String
    remedy: String
  }

  type Complaint {
    odiNumber: String!
    dateOfIncident: String
    dateFiled: String
    component: String
    summary: String
    crash: Boolean!
    fire: Boolean!
    injuries: Int!
    deaths: Int!
  }

  # Star ratings are strings because NHTSA returns "Not Rated" for some tests
  type SafetyRating {
    vehicleId: Int!
    description: String!
    overall: String
    frontCrash: String
    sideCrash: String
    rollover: String
  }

  type VehicleReport {
    make: String!
    model: String!
    year: Int!
    recalls: [Recall!]!
    complaints: [Complaint!]!
    safetyRatings: [SafetyRating!]!
  }

  type Users {
    user_id: Int!,
    clerk_user_id: String,
    first_name: String!,
    last_name: String!,
    email_address: String!
    favorite_manufactures: [String]
  }
  
  type Query {
    allManufacturers: [AllManufacturers!]!
    getMakeForManufacturer(searchTerm: String!): [GetMakeForManufacturer!]!
    getModelsForMakeId(makeId: Int!): [GetModelsForMakeId!]!
    modelsForMakeYear(make: String!, year: Int!): [ModelForMakeYear!]!
    vehicleReport(make: String!, model: String!, year: Int!): VehicleReport!
    users(clerkUserId: String): [Users]!
  }


  type Mutation {
    updateUserFavorites(    
      clerkUserId: String,
      favoriteManufacturer: [String]
    ) : Boolean
  }
`;
