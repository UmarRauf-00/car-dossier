// Import everything needed to use the `useQuery` hook

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import WelcomePage from "./components/WelcomePage";
import { Box, Typography } from "@mui/material";

function App() {
  return (
    <>
      <Box
        sx={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          height: 300,
          backgroundImage:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(18, 18, 18, 0.73)), url(./assets/top-banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px 8px 0 0 ",
          // For text
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            backgroundColor: "#0000005a",
            padding: "20px",
            border: "4px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "2px",
            fontSize: "5rem",
            textShadow: "#1e2e42 1px 0 10px",
          }}
        >
          Car Dossier
        </Typography>
      </Box>
      <div>
        <WelcomePage />
      </div>
    </>
  );
}

export default App;
