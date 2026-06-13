// Import everything needed to use the `useQuery` hook
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import "./App.css";

const GET_CARS = gql`
  query GetAllCars {
    cars {
      id
      make
      model
      year
      trim
    }
  }
`;

function DisplayLocations() {
  const { loading, error, data } = useQuery(GET_CARS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  // @ts-expect-error - This is just a setup - will add types when plugging in actual apis
  return data.cars.map(({ id, make, model, trim }) => (
    <div key={id}>
      <h3>{make}</h3>
      <p>Model: {model}</p>
      <p>Trim: {trim}</p>
    </div>
  ));
}

function App() {
  return (
    <div>
      <h2>My first Apollo app 🚀</h2>
      <DisplayLocations />
    </div>
  );
}

export default App;
