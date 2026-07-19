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
  Tooltip,
  Alert,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useUser } from "@clerk/react";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Link } from "react-router";

interface makeForManufacturerType {
  makeId: number;
  makeName: string;
  manufacturerName: string;
}

interface usersType {
  user_id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  favorite_manufactures: string[];
}

const QUERY: TypedDocumentNode<
  {
    getMakeForManufacturer: makeForManufacturerType[];
    users?: usersType[];
  },
  { searchTerm?: string; clerkUserId?: string; isSignedIn: boolean }
> = gql`
  query getMake(
    $searchTerm: String!
    $clerkUserId: String
    $isSignedIn: Boolean!
  ) {
    getMakeForManufacturer(searchTerm: $searchTerm) {
      makeId
      makeName
      manufacturerName
    }
    users(clerkUserId: $clerkUserId) @include(if: $isSignedIn) {
      favorite_manufactures
    }
  }
`;

interface updateUserQueryType {
  clerkUserId: string;
  favoriteManufacturer: string[];
}

const MUTATION_QUERY: TypedDocumentNode<
  { updateUser: updateUserQueryType },
  updateUserQueryType
> = gql`
  mutation updateUser($clerkUserId: String, $favoriteManufacturer: [String]) {
    updateUserFavorites(
      clerkUserId: $clerkUserId
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
  const { user, isSignedIn, isLoaded } = useUser();
  const clerkUser = user; // just an alias for clarity on which user object is being used
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
    variables: {
      searchTerm,
      clerkUserId: clerkUser?.id,
      isSignedIn: !!isSignedIn,
    },
    fetchPolicy: "network-only",
    skip: !searchTerm || !isLoaded,
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

    if (!clerkUser || !clerkUser?.id) return;

    //debouncing checkbox click by 500ms
    const timer = setTimeout(() => {
      const manufacturers = favoriteManufacturer.map(
        (f) => `${f.id}:${f.manufacturerName}`,
      );
      updateUserFavorites({
        variables: {
          clerkUserId: clerkUser.id,
          favoriteManufacturer: manufacturers,
        },
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteManufacturer, updateUserFavorites]);

  useEffect(() => {
    if (data?.users) {
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
    console.log("%c⧭", "color: #ffa280", { data /* favoriteManufacturer */ });
    // favoriteManufacturer.map((f) => `${f.id} - ${f.manufacturerName}`),
  }, [data, favoriteManufacturer]);

  if (error) return <p>Error : {error.message}</p>;
  if (searchTerm && !loading && !data) return;
  if (data && data.getMakeForManufacturer.length === 0)
    return (
      <Alert variant="standard" severity="info">
        No Results Found
      </Alert>
    );

  return (
    !loading &&
    data && (
      <Stack>
        <TableContainer sx={{ width: "100%" }}>
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
                <TableRow key={d.makeId + d.manufacturerName} hover>
                  <TableCell component="th" scope="row" sx={{ width: 400 }}>
                    <Link to={`/makeDetails/${d.makeId}`}>
                      {d.makeId} - {d.makeName}
                    </Link>
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ width: 550 }}>
                    {d.manufacturerName}
                  </TableCell>

                  <TableCell component="th" scope="row" sx={{ width: 100 }}>
                    <Tooltip
                      title={
                        isSignedIn
                          ? "Favorite this manufacturer"
                          : "Sign in to favorite a manufacturer"
                      }
                      data-testid="favorite-tooltip"
                    >
                      <span>
                        <Checkbox
                          icon={<FavoriteBorder />}
                          checkedIcon={<Favorite />}
                          disabled={!isSignedIn}
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
                      </span>
                    </Tooltip>
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
