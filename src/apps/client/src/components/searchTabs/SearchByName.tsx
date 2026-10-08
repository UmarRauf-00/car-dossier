import { Stack, Typography } from "@mui/material";
import SearchInput from "./SearchInput";
import { useState } from "react";
import { useSearchParams } from "react-router";

import DisplayAllMakes from "./DisplayAllMakes";
// type Props = {}

const SearchByName = (/* {}: Props */) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTermValue, setSearchTermValue] = useState<string | undefined>(
    searchParams.get("searchTerm") ?? undefined,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearchClick = (searchTerm?: string) => {
    setSearchTermValue(searchTerm);
    if (searchTerm) {
      setSearchParams({ searchTerm });
    }
  };

  return (
    <>
      <Stack spacing={2.5} sx={{ maxWidth: 720, mb: 5 }}>
        <Typography variant="overline" color="text.secondary">
          NHTSA vehicle records
        </Typography>
        <Typography variant="h1">Look up any manufacturer.</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 18 }}>
          Search the NHTSA database by manufacturer name, then open a make to
          see every model on record.
        </Typography>
        <SearchInput
          loading={loading}
          onSearch={handleSearchClick}
          placeholder="e.g. Honda, Toyota, Ford"
          searchTermValue={searchTermValue}
        />
      </Stack>

      <DisplayAllMakes searchTerm={searchTermValue} setLoading={setLoading} />
    </>
  );
};

export default SearchByName;
