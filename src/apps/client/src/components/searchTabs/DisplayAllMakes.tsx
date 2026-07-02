import { gql, type TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { Link } from "react-router";

interface apiData {
  makeId: number;
  makeName: string;
  manufacturerName: string;
  users: {
    user_id: number;
    first_name: string;
    last_name: string;
    favorite_manufactures: number[];
  };
}

const QUERY: TypedDocumentNode<
  {
    getMakeForManufacturer: apiData[];
  },
  { searchTerm?: string; userId?: string }
> = gql`
  query getMake($searchTerm: String!, $userId: String) {
    getMakeForManufacturer(searchTerm: $searchTerm) {
      makeId
      makeName
      manufacturerName
    }
    users(userId: $userId) {
      first_name
      last_name
      favorite_manufactures
    }
  }
`;

const MUTATION_QUERY: TypedDocumentNode<
  { updateUser: { userId: number; favoriteIds: number[] } },
  { userId: number; favoriteIds: number[] }
> = gql`
  mutation updateUser($userId: Int, $favoriteIds: [Int]) {
    updateUserFavorites(userId: $userId, favoriteIds: $favoriteIds)
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

interface FavoriteIdsType {
  id: number;
  manufacturerName: string;
}

const DisplayAllMakes = ({ searchTerm, setLoading }: Props) => {
  const [favoriteIds, setFavoriteIds] = useState<FavoriteIdsType[]>([]);

  const handleCheckboxChange = (makeId: number, manufacturerName: string) => {
    if (
      !favoriteIds.find(
        (f) => f.id === makeId && f.manufacturerName === manufacturerName,
      )
    ) {
      setFavoriteIds((prevFav) => {
        return [...prevFav, { id: makeId, manufacturerName }];
      });
    } else {
      setFavoriteIds((prevFav) =>
        prevFav.filter(
          (f) => f.id !== makeId || f.manufacturerName !== manufacturerName,
        ),
      );
    }
  };

  const { loading, error, data } = useQuery(QUERY, {
    variables: { searchTerm },
    fetchPolicy: "network-only",
    skip: !searchTerm,
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const [updateUserFavorites] = useMutation(MUTATION_QUERY);

  useEffect(() => {
    //debouncing checkbox click by 500ms
    const timer = setTimeout(() => {
      const ids = favoriteIds.map((f) => f.id);
      updateUserFavorites({
        variables: {
          userId: 2, // This needs to be replaced with a logged in user's user_ida
          favoriteIds: ids,
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [favoriteIds, updateUserFavorites]);

  if (error) return <p>Error : {error.message}</p>;
  if (searchTerm && !loading && !data) return <p>Data is undefined</p>;
  if (data && data.getMakeForManufacturer.length === 0)
    return "No Results Found";

  // DEBUGGING
  console.log(
    data,
    // favoriteIds.map((f) => `${f.id} - ${f.manufacturerName}`),
  );

  return (
    !loading &&
    data && (
      <TableContainer>
        <Table stickyHeader sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>MakeId & Make</StyledTableCell>
              <StyledTableCell>Manufacturer</StyledTableCell>
              <StyledTableCell>Favorite</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.getMakeForManufacturer.map((d) => (
              <TableRow key={d.makeId + d.manufacturerName}>
                <TableCell component="th" scope="row" sx={{ minWidth: 400 }}>
                  <Link to={`/makeDetails/${d.makeId}`}>
                    {d.makeId} - {d.makeName}
                  </Link>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ minWidth: 550 }}>
                  {d.manufacturerName}
                </TableCell>
                <TableCell component="th" scope="row" sx={{ minWidth: 100 }}>
                  <Checkbox
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite />}
                    slotProps={{ input: { "aria-label": "Favorite checkbox" } }}
                    checked={favoriteIds.some(
                      (f) =>
                        f.id === d.makeId &&
                        f.manufacturerName === d.manufacturerName,
                    )}
                    onChange={() =>
                      handleCheckboxChange(d.makeId, d.manufacturerName)
                    }
                  />
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
