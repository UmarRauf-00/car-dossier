import { TextField, Button, InputAdornment, MenuItem } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

// NHTSA's model data is reliable from the mid-90s; next year's models are
// often listed already
const FIRST_YEAR = 1995;
const years = Array.from(
  { length: new Date().getFullYear() + 1 - FIRST_YEAR + 1 },
  (_, i) => new Date().getFullYear() + 1 - i,
);

type Props = {
  onSearch: (make: string, year: number) => void;
  loading: boolean;
  makeValue?: string;
  yearValue?: number;
};

const SearchInput = ({ onSearch, loading, makeValue, yearValue }: Props) => {
  const [make, setMake] = useState(makeValue ?? "");
  const [year, setYear] = useState<number | "">(yearValue ?? "");

  const canSearch = make.trim() !== "" && year !== "";

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSearch) onSearch(make.trim(), year);
      }}
      sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}
    >
      <TextField
        placeholder="Make, e.g. Honda, Toyota, Ford"
        value={make}
        onChange={(e) => setMake(e.target.value)}
        sx={{ flex: "1 1 280px" }}
        slotProps={{
          htmlInput: { "aria-label": "Make" },
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
      <TextField
        select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        sx={{ flex: "0 0 140px" }}
        slotProps={{
          htmlInput: { "aria-label": "Model year" },
          input: { sx: { height: 52 } },
          select: {
            displayEmpty: true,
            renderValue: (v) => (v === "" ? "Year" : String(v)),
            MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } },
          },
        }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </TextField>
      <Button
        aria-label="search-by-name-submit-button"
        loading={loading}
        disabled={!canSearch}
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
