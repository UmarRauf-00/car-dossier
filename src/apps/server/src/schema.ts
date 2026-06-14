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

  type Query {
    allManufacturers: [AllManufacturers!]!
  }
`;
