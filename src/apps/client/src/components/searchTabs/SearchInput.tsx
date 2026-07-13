import { TextField, Button } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";

type Props = {
  placeholder?: string;
  onSearch: (value?: string) => void;
  loading: boolean;
};

const SearchInput = ({ placeholder, onSearch, loading }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchBox = () => {
    return (
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(searchTerm);
        }}
      >
        <TextField
          placeholder={placeholder ?? "Enter Search Term"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", my: 2 }}>
          {/* <Button
            aria-label="search-by-name-clear-button"
            endIcon={<DeleteForeverIcon />}
            disabled={loading}
            size="large"
            type="reset"
            variant="outlined"
            color="error"
            sx={{
              color: "#F76464",
            }}
          >
            Clear
          </Button> */}
          <Button
            aria-label="search-by-name-submit-button"
            sx={{
              background: "#175ca0",
              color: "#FFFFFF",
            }}
            endIcon={<SendIcon />}
            loading={loading}
            disabled={!searchTerm.trim()}
            loadingPosition="end"
            size="large"
            type="submit"
            variant="contained"
            fullWidth
          >
            Search
          </Button>
        </Box>
      </Box>
    );
  };

  return searchBox();
};

export default SearchInput;
