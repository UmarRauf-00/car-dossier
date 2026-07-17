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
    users(clerkUserId: String): [Users]!
  }


  type Mutation {
    updateUserFavorites(    
      clerkUserId: String,
      favoriteManufacturer: [String]
    ) : Boolean
  }
`;
