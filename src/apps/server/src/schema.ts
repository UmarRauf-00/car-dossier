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

  type Query {
    allManufacturers: [AllManufacturers!]!
    getMakeForManufacturer(searchTerm: String!): [GetMakeForManufacturer!]!
  }
`;
