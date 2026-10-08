import { TextField, Button, InputAdornment } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
  placeholder?: string;
  onSearch: (value?: string) => void;
  loading: boolean;
  searchTermValue?: string;
};

const SearchInput = ({
  placeholder,
  onSearch,
  loading,
  searchTermValue,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState(searchTermValue ?? "");

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(searchTerm);
      }}
      sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}
    >
      <TextField
        placeholder={placeholder ?? "Enter Search Term"}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flex: "1 1 320px" }}
        slotProps={{
          htmlInput: { "aria-label": "Manufacturer name" },
          input: {
            sx: { height: 52 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <Button
        aria-label="search-by-name-submit-button"
        loading={loading}
        disabled={!searchTerm.trim()}
        size="large"
        type="submit"
        variant="contained"
        sx={{ height: 52, px: 3.5, borderRadius: "10px", fontSize: 16 }}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchInput;
