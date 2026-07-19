import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import WelcomePage from "./components/WelcomePage";
import AuthBar from "./components/AuthBar";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ minHeight: "1126px" }}>
      <div className="banner-wrapper">
        <div className="banner-img">
          <h1 className="banner-title">Car Dossier</h1>
        </div>
        <AuthBar />
      </div>
      <div>
        <WelcomePage />
      </div>
    </Box>
  );
}

export default App;
