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
type GetModelsForMakeId = {
  makeId: number;
  modelId: number;
  makeName: string;
  modelName: string;
};

type Props = {
  makeId?: number;
};

const QUERY = gql`
  query getModelsForMake($makeId: Int!) {
    getModelsForMakeId(makeId: $makeId) {
      makeId
      modelId
      makeName
      modelName
    }
  }
`;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const DisplayDetailsForMake = ({ makeId }: Props) => {
  const { loading, error, data } = useQuery<{
    getModelsForMakeId: GetModelsForMakeId[];
  }>(QUERY, {
    variables: { makeId },
    fetchPolicy: "network-only",
    skip: !makeId,
  });

  if (error) return <p>Error : {error.message}</p>;
  if (makeId && !loading && !data) return <p>Data is undefined</p>;
  if (data && data.getModelsForMakeId.length === 0) return "No Results Found";

  console.log({ data, makeId });

  // return makeId
  //   ? !loading &&
  //       data &&
  //       data.getModelsForMakeId.map((d) => (
  //         <Box key={d.modelId + d.makeId}>
  //           {d.makeId} - {d.makeName} - {d.modelName}
  //         </Box>
  //       ))
  //   : "No valid Make ID was provided";
  return makeId ? (
    <TableContainer>
      <Table stickyHeader sx={{ minWidth: 500 }}>
        <TableHead>
          <TableRow>
            <StyledTableCell>Selected MakeId</StyledTableCell>
            <StyledTableCell>Make</StyledTableCell>
            <StyledTableCell>Manufacturer</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading &&
            data &&
            data.getModelsForMakeId.map((d) => (
              <TableRow key={d.modelId}>
                <TableCell component="th" scope="row" sx={{ minWidth: 200 }}>
                  {d.makeId}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ minWidth: 400 }}>
                  {/* <Link to={`/makeDetails/${d.makeId}`}> */}
                  {d.makeName}
                  {/* </Link> */}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ minWidth: 650 }}>
                  {d.modelName}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    "No valid Make ID was provided"
  );
};

export default DisplayDetailsForMake;
