import { Stack, Typography } from "@mui/material";
import SearchInput from "./SearchInput";
import { useState } from "react";
import { useSearchParams } from "react-router";

import DisplayAllMakes from "./DisplayAllMakes";
// type Props = {}

const SearchByName = (/* {}: Props */) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // make + year live in the URL (?make=honda&year=2015) so a search
  // survives reloads and the back button
  const make = searchParams.get("make") ?? undefined;
  const yearParam = Number(searchParams.get("year"));
  const year =
    Number.isInteger(yearParam) && yearParam > 0 ? yearParam : undefined;
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = (newMake: string, newYear: number) => {
    setSearchParams({ make: newMake, year: String(newYear) });
  };

  return (
    <>
      <Stack spacing={2.5} sx={{ maxWidth: 720, mb: 5 }}>
        <Typography variant="overline" color="text.secondary">
          NHTSA vehicle records
        </Typography>
        <Typography variant="h1">Look up any car by make and year.</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 18 }}>
          Pick a make and model year, then open a model to see its recalls,
          owner complaints and safety ratings.
        </Typography>
        <SearchInput
          loading={loading}
          onSearch={handleSearch}
          makeValue={make}
          yearValue={year}
        />
      </Stack>

      <DisplayAllMakes make={make} year={year} setLoading={setLoading} />
    </>
  );
};

export default SearchByName;
