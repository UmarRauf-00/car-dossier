import { Box } from "@mui/material";

export const bannerImage = () => (
  <Box
    sx={{
      width: "100%",
      height: 300,
      backgroundImage:
        " linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url(./assets/top-banner.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderRadius: "8px 8px 0 0 ",
    }}
  />
);
