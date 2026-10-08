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
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Link } from "react-router";
import ChatDrawer from "../../ai-chat/ChatDrawer";
import { monoFont } from "../../theme";
import { vehiclePath } from "../../helpers/paths";

interface ModelForMakeYearType {
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
  year: number;
}

interface usersType {
  favorite_manufactures: string[];
}

const QUERY: TypedDocumentNode<
  {
    modelsForMakeYear: ModelForMakeYearType[];
    users?: usersType[];
  },
  { make?: string; year?: number; clerkUserId?: string; isSignedIn: boolean }
> = gql`
  query modelsForMakeYear(
    $make: String!
    $year: Int!
    $clerkUserId: String
    $isSignedIn: Boolean!
  ) {
    modelsForMakeYear(make: $make, year: $year) {
      makeId
      makeName
      modelId
      modelName
      year
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
  make: string | undefined;
  year: number | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

// A favourite is one model in one year, stored in the DB as "modelId:year"
interface FavoriteType {
  modelId: number;
  year: number;
}

const isSameFavorite = (a: FavoriteType, b: FavoriteType) =>
  a.modelId === b.modelId && a.year === b.year;

const DisplayAllMakes = ({ make, year, setLoading }: Props) => {
  const { user, isSignedIn } = useUser();
  const clerkUser = user; // just an alias for clarity on which user object is being used
  // null until the user clicks a heart; until then favourites come from the DB
  const [changedFavorites, setChangedFavorites] = useState<
    FavoriteType[] | null
  >(null);
  // Only true after a checkbox click, so loading favorites from the server (or
  // StrictMode re-running effects) never sends an empty list that wipes the DB.
  const hasUserChanged = useRef(false);

  const handleCheckboxChange = (fav: FavoriteType) => {
    hasUserChanged.current = true;
    const prev = favorites;
    setChangedFavorites(
      prev.some((f) => isSameFavorite(f, fav))
        ? prev.filter((f) => !isSameFavorite(f, fav))
        : [...prev, fav],
    );
  };

  const { loading, error, data } = useQuery(QUERY, {
    variables: {
      make,
      year,
      clerkUserId: clerkUser?.id,
      isSignedIn: !!isSignedIn,
    },
    fetchPolicy: "network-only",
    skip: !make || !year,
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  // Parse the saved "modelId:year" strings. Entries in any other shape (e.g.
  // the older "makeId:Manufacturer" favourites) parse to NaN and are skipped.
  const savedFavorites = useMemo<FavoriteType[]>(
    () =>
      (data?.users ?? [])
        .flatMap((u) => u.favorite_manufactures ?? [])
        .map((fm) => {
          const [modelId, favYear] = fm.replaceAll("\\", "").split(":");
          return { modelId: Number(modelId), year: Number(favYear) };
        })
        .filter((f) => Number.isInteger(f.modelId) && Number.isInteger(f.year)),
    [data],
  );
  const favorites = changedFavorites ?? savedFavorites;

  const [updateUserFavorites] = useMutation(MUTATION_QUERY);

  useEffect(() => {
    // Skip state changes that didn't come from a checkbox click
    if (!hasUserChanged.current) return;

    if (!clerkUser || !clerkUser?.id) return;

    //debouncing checkbox click by 500ms
    const timer = setTimeout(() => {
      hasUserChanged.current = false;
      updateUserFavorites({
        variables: {
          clerkUserId: clerkUser.id,
          favoriteManufacturer: (changedFavorites ?? []).map(
            (f) => `${f.modelId}:${f.year}`,
          ),
        },
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedFavorites, updateUserFavorites]);

  if (error) return <p>Error : {error.message}</p>;
  if (!make || !year || loading || !data) return null;
  if (data.modelsForMakeYear.length === 0)
    return (
      <Alert variant="standard" severity="info">
        No {year} models found for “{make}”. Check the spelling, or try another
        year.
      </Alert>
    );

  const models = data.modelsForMakeYear;
  const makeName = models[0].makeName;

  return (
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
          {models.length} {year} {makeName} models
        </Typography>
        <ChatDrawer vehicleData={models} />
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 120 }}>Model ID</TableCell>
              <TableCell>Model</TableCell>
              <TableCell sx={{ width: 100 }}>Year</TableCell>
              <TableCell align="center" sx={{ width: 100 }}>
                Favorite
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((d) => {
              const fav = { modelId: d.modelId, year: d.year };
              return (
                <TableRow key={d.modelId} hover>
                  <TableCell
                    sx={{ fontFamily: monoFont, color: "text.secondary" }}
                  >
                    {d.modelId}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Link
                      to={vehiclePath(d.makeName, d.modelName, d.year)}
                      style={{ fontWeight: 500 }}
                    >
                      {d.modelName}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {d.year}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5 }}>
                    <Tooltip
                      title={
                        isSignedIn
                          ? "Favorite this model"
                          : "Sign in to favorite a model"
                      }
                      data-testid="favorite-tooltip"
                    >
                      <span>
                        <Checkbox
                          icon={<FavoriteBorder />}
                          checkedIcon={<Favorite />}
                          disabled={!isSignedIn}
                          slotProps={{
                            input: {
                              "aria-label": `Favorite ${d.year} ${d.modelName}`,
                            },
                          }}
                          checked={favorites.some((f) =>
                            isSameFavorite(f, fav),
                          )}
                          onChange={() => handleCheckboxChange(fav)}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default DisplayAllMakes;
