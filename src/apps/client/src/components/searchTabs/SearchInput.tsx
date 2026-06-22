import { TextField, Button } from "@mui/material";
import { Box } from "@mui/system";
import { useRef, useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
          <Button
            aria-label="search-by-name-clear-button"
            color="error"
            endIcon={<DeleteForeverIcon />}
            disabled={loading}
            size="large"
            type="reset"
            variant="outlined"
          >
            Clear
          </Button>
          <Button
            aria-label="search-by-name-submit-button"
            color="success"
            endIcon={<SendIcon />}
            loading={loading}
            disabled={!searchTerm.trim()}
            loadingPosition="end"
            size="large"
            type="submit"
            variant="contained"
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
