import { gql, type TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Stack,
  Tooltip,
  Alert,
  Typography,
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
import ChatDrawer from "../../ai-chat/ChatDrawer";
import { monoFont } from "../../theme";

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

interface FavoriteManufacturerType {
  id?: number;
  manufacturerName?: string;
}

const DisplayAllMakes = ({ searchTerm, setLoading }: Props) => {
  const { user, isSignedIn } = useUser();
  const clerkUser = user; // just an alias for clarity on which user object is being used
  const [favoriteManufacturer, setFavoriteManufacturer] = useState<
    FavoriteManufacturerType[]
  >([]);
  // Only true after a checkbox click, so loading favorites from the server (or
  // StrictMode re-running effects) never sends an empty list that wipes the DB.
  const hasUserChanged = useRef(false);

  const handleCheckboxChange = (makeId: number, manufacturerName: string) => {
    hasUserChanged.current = true;
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
    skip: !searchTerm, // || !isLoaded,
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const [updateUserFavorites] = useMutation(MUTATION_QUERY);

  useEffect(() => {
    // Skip state changes that didn't come from a checkbox click
    if (!hasUserChanged.current) return;

    if (!clerkUser || !clerkUser?.id) return;

    //debouncing checkbox click by 500ms
    const timer = setTimeout(() => {
      hasUserChanged.current = false;
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
      <Stack spacing={2} component="section" aria-labelledby="results-heading">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="h2" id="results-heading">
            {data.getMakeForManufacturer.length} results for “{searchTerm}”
          </Typography>
          <ChatDrawer vehicleData={data.getMakeForManufacturer} />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Make ID</TableCell>
                <TableCell sx={{ width: 160 }}>Make</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>
                  Favorite
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.getMakeForManufacturer.map((d) => (
                <TableRow key={d.makeId + d.manufacturerName} hover>
                  <TableCell
                    sx={{ fontFamily: monoFont, color: "text.secondary" }}
                  >
                    {d.makeId}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Link
                      to={`/makeDetails/${d.makeId}`}
                      style={{ fontWeight: 500 }}
                    >
                      {d.makeName}
                    </Link>
                  </TableCell>
                  <TableCell>{d.manufacturerName}</TableCell>
                  <TableCell align="center" sx={{ py: 0.5 }}>
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
