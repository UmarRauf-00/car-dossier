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
      <div>
        <WelcomePage />
      </div>
    </>
  );
}

export default App;
