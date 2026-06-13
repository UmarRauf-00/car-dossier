export const typeDefs = `#graphql
  type Car {
    id: ID!
    make: String!
    model: String!
    year: Int!
    trim: String
  }

  type Query {
    cars: [Car!]!
    car(id: ID!): Car
  }
`

