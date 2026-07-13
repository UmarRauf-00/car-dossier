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
  Stack,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Link } from "react-router";
import { Box } from "@mui/system";
import GetClerkUser from "../../clerkHooks";

interface makeForManufacturerType {
  makeId: number;
  makeName: string;
  manufacturerName: string;
}

interface usersType {
  user_id: number;
  // first_name: string;
  // last_name: string;
  email_address: string;
  favorite_manufactures: string[];
}

const QUERY: TypedDocumentNode<
  {
    getMakeForManufacturer: makeForManufacturerType[];
    users: usersType[];
  },
  { searchTerm?: string; userId?: number }
> = gql`
  query getMake($searchTerm: String!, $userId: Int) {
    getMakeForManufacturer(searchTerm: $searchTerm) {
      makeId
      makeName
      manufacturerName
    }
    users(userId: $userId) {
      user_id
      email_address
      favorite_manufactures
    }
  }
`;

const MUTATION_QUERY: TypedDocumentNode<
  { updateUser: { userId: number; favoriteManufacturer: string[] } },
  { userId: number; favoriteManufacturer: string[] }
> = gql`
  mutation updateUser($userId: Int, $favoriteManufacturer: [String]) {
    updateUserFavorites(
      userId: $userId
      favoriteManufacturer: $favoriteManufacturer
    )
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

interface FavoriteManufacturerType {
  id?: number;
  manufacturerName?: string;
}

const DisplayAllMakes = ({ searchTerm, setLoading }: Props) => {
  const [favoriteManufacturer, setFavoriteManufacturer] = useState<
    FavoriteManufacturerType[]
  >([]);
  const isFirstRender = useRef(true);

  const handleCheckboxChange = (makeId: number, manufacturerName: string) => {
    if (
      !favoriteManufacturer.find(
        (f) => f.id === makeId && f.manufacturerName === manufacturerName,
      )
    ) {
      setFavoriteManufacturer((prevFav) => {
        return [...prevFav, { id: makeId, manufacturerName }];
      });
    } else {
      setFavoriteManufacturer((prevFav) =>
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
    // To stop it from calling the mutation with an empty array
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    //debouncing checkbox click by 500ms
    const timer = setTimeout(() => {
      const manufacturers = favoriteManufacturer.map(
        (f) => `${f.id}:${f.manufacturerName}`,
      );
      updateUserFavorites({
        variables: {
          userId: 2, // This needs to be replaced with a logged in user's user_ida
          favoriteManufacturer: manufacturers,
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [favoriteManufacturer, updateUserFavorites]);

  useEffect(() => {
    if (data) {
      const favoritesArray: FavoriteManufacturerType[] = [];
      data.users.map((user) => {
        user.favorite_manufactures.map((fm) => {
          // Splitting the composite ID
          const splitStrings = fm.replaceAll("\\", "").split(":");
          favoritesArray.push({
            id: parseInt(splitStrings[0]),
            manufacturerName: splitStrings[1],
          });
        });
        setFavoriteManufacturer(favoritesArray);
      });
    }
  }, [data]);

  useEffect(() => {
    // DEBUGGING
    console.log(
      { data, favoriteManufacturer },
      // favoriteManufacturer.map((f) => `${f.id} - ${f.manufacturerName}`),
    );
  }, [data, favoriteManufacturer]);

  if (error) return <p>Error : {error.message}</p>;
  if (searchTerm && !loading && !data) return <p>Data is undefined</p>;
  if (data && data.getMakeForManufacturer.length === 0)
    return "No Results Found";

  return (
    !loading &&
    data && (
      <Stack>
        <Box>
          <GetClerkUser />
          {data.users.map((u) => u.email_address)}
        </Box>
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
                      slotProps={{
                        input: { "aria-label": "Favorite checkbox" },
                      }}
                      checked={favoriteManufacturer.some(
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
      </Stack>
    )
  );
};

export default DisplayAllMakes;
