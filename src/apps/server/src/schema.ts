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
     first_name: String!,
    last_name: String!
    favorite_manufactures: [String]
  }
  
  type Query {
    allManufacturers: [AllManufacturers!]!
    getMakeForManufacturer(searchTerm: String!): [GetMakeForManufacturer!]!
    getModelsForMakeId(makeId: Int!): [GetModelsForMakeId!]!
    users(userId: String): [Users]!
  }

  type Mutation {
    updateUserFavorites(userId: Int, favoriteIds: [Int]) : Boolean
  }
`;
