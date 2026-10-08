import { Stack } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Link, useParams } from "react-router";
import DisplayDetailsForMake from "./DisplayDetailsForMake";

const GetDetailsByMakeID = () => {
  const { makeId } = useParams();

  return (
    <Stack spacing={3}>
      {/* history.back() keeps the user's search; "/" is the fallback when
          the page was opened directly */}
      <Link
        to="/"
        onClick={(e) => {
          if (window.history.length > 1) {
            e.preventDefault();
            window.history.back();
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          minHeight: 44,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <ArrowBack fontSize="small" />
        Back to results
      </Link>
      {makeId && <DisplayDetailsForMake makeId={parseInt(makeId, 10)} />}
    </Stack>
  );
};

export default GetDetailsByMakeID;
