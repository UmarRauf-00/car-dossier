import { Typography } from "@mui/material";

import { useParams } from "react-router";
import DisplayDetailsForMake from "./DisplayDetailsForMake";

// type Props = {};

const GetDetailsByMakeID = (/* props: Props */) => {
  const { makeId } = useParams();

  return (
    <>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ display: "flex", justifyContent: "center", my: 4 }}
      >
        Vehicle Make Details
      </Typography>
      {/* <SearchInput
        loading={false}
        onSearch={handleSearchClick}
        placeholder="Enter the VIN number of the car"
      /> */}
      {makeId && <DisplayDetailsForMake makeId={parseInt(makeId, 10)} />}
    </>
  );
};

export default GetDetailsByMakeID;
