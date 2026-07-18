import { Typography } from "@mui/material";
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
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}
      >
        Search By Manufacturer Name
      </Typography>
      <SearchInput
        loading={loading}
        onSearch={handleSearchClick}
        placeholder="Enter the name of the car"
        searchTermValue={searchTermValue}
      />

      <DisplayAllMakes searchTerm={searchTermValue} setLoading={setLoading} />
    </>
  );
};

export default SearchByName;
