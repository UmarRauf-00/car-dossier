import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface apiData {
  makeId: number;
  makeName: string;
  manufacturerName: string;
}

const QUERY = gql`
  query getMake($searchTerm: String!) {
    getMakeForManufacturer(searchTerm: $searchTerm) {
      makeId
      makeName
      manufacturerName
    }
  }
`;

type Props = {
  searchTerm: string | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const DisplayAllMakes = ({ searchTerm, setLoading }: Props) => {
  const { loading, error, data } = useQuery<{
    getMakeForManufacturer: apiData[];
  }>(QUERY, {
    variables: { searchTerm },
    fetchPolicy: "network-only",
    skip: !searchTerm,
  });

  // NetworkStatus.loading is 1 (initial load) or 4 (refetch/variable change)
  // const isSearching = loading || networkStatus === 4;

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  if (error) return <p>Error : {error.message}</p>;
  if (searchTerm && !loading && !data) return <p>Data is undefined</p>;
  if (data && data.getMakeForManufacturer.length === 0)
    return "No Results Found";

  console.log({ data });

  return (
    !loading &&
    data && (
      <TableContainer>
        <Table stickyHeader sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Make</StyledTableCell>
              <StyledTableCell>Manufacturer</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.getMakeForManufacturer.map((d) => (
              <TableRow key={d.makeId + d.manufacturerName}>
                <TableCell component="th" scope="row" sx={{ minWidth: 400 }}>
                  {d.makeName}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ minWidth: 650 }}>
                  {d.manufacturerName}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
};

export default DisplayAllMakes;
