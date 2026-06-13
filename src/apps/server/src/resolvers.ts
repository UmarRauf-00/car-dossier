const dummyCars = [
  { id: '1', make: 'Honda', model: 'Accord', year: 2012, trim: 'Euro' },
  { id: '2', make: 'Toyota', model: 'Camry', year: 2019, trim: 'SE' },
  { id: '3', make: 'Ford', model: 'Mustang', year: 2021, trim: 'GT' },
]

export const resolvers = {
  Query: {
    cars: () => dummyCars,
    car: (_: unknown, { id }: { id: string }) =>
      dummyCars.find(car => car.id === id) ?? null,
  },
}
