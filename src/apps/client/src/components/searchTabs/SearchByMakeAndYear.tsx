// type Props = {};

import { TextField, Button, Typography } from "@mui/material";
import { Box, textAlign } from "@mui/system";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SendIcon from "@mui/icons-material/Send";

import { useRef } from "react";

const SearchByMakeAndYear = (/* props: Props */) => {
  const carMake = useRef<HTMLInputElement>(null);
  const carYear = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    const make = carMake.current?.value;
    const year = carYear.current?.value;

    return make && year ? console.log({ make, year }) : null;
  };

  const searchBox = () => {
    return (
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchClick();
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-evenly", gap: 2 }}>
          <TextField
            label="Make"
            placeholder={"Enter the Make/Manufacturer name of the car"}
            inputRef={carMake}
            fullWidth
          />
          <TextField
            label="Year"
            placeholder={"Enter the Year/Model of the car"}
            inputRef={carYear}
            fullWidth
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", my: 2 }}>
          <Button
            type="reset"
            size="large"
            variant="outlined"
            endIcon={<DeleteForeverIcon />}
            aria-label="search-by-name-submit-button"
            color="error"
          >
            Clear
          </Button>
          <Button
            size="large"
            type="submit"
            endIcon={<SendIcon />}
            // loading={loading} // enable after we have the api setup
            loadingPosition="end"
            variant="contained"
            color="success"
          >
            Search
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}
      >
        Search By Manufacturer Name and Year
      </Typography>
      {searchBox()}
    </>
  );
};

export default SearchByMakeAndYear;
