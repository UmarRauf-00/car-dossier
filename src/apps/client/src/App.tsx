// Import everything needed to use the `useQuery` hook
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import "./App.css";

const GET_ALL_MAKES = gql`
  query GetAllManufacturers {
    allManufacturers {
      id
      country
      companyName
      fullCompanyName
      vehicleType {
        name
      }
    }
  }
`;

interface dataType {
  id: number;
  companyName: string;
  country: string;
  fullCompanyName: string;
  vehicleType: [
    {
      IsPrimary: boolean;
      Name: string;
    },
  ];
}

const DisplayAllMakes = () => {
  const { loading, error, data } = useQuery<{ allManufacturers: dataType[] }>(
    GET_ALL_MAKES,
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if (!data) return <p>Data is undefined</p>;

  console.log("%c⧭", "color: #00a3cc", { data });

  // // @ts-expect-error - This is just a setup - will add types when plugging in actual apis
  return data.allManufacturers.map((d) => {
    return (
      <div
        key={d.id}
        style={{
          display: "flex",
          textAlign: "left",
        }}
      >
        <ul>
          {d.country && <li>{d.companyName}</li>}
          <li>{d.country}</li>
          <li>{d.fullCompanyName}</li>
          {d.vehicleType.length > 0 && (
            <li>{d.vehicleType.map((vehicle) => vehicle.Name)}</li>
          )}
        </ul>
      </div>
    );
  });
};

function App() {
  return (
    <div>
      <h2>All Car Manufacturers</h2>
      <DisplayAllMakes />
    </div>
  );
}

export default App;
