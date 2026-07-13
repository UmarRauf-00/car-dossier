import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import WelcomePage from "./components/WelcomePage";
import { AppBar, Box, Button, Toolbar } from "@mui/material";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/react-router";

function App() {
  const { isSignedIn } = useUser();

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "#FFFFFF",
          maxWidth: "20rem",
          // position: "relative",
          // right: 0,
          // left: "764.2px",
          // height: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "center", gap: 5 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton>
                  <Button
                    name="sign-in-button"
                    variant="contained"
                    sx={{ background: "#076ccb", color: "#FFFFFF" }}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    name="sign-up-button"
                    variant="contained"
                    sx={{ background: "#076ccb", color: "#FFFFFF" }}
                  >
                    Sign up
                  </Button>
                </SignUpButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <div>
        <WelcomePage />
      </div>
    </>
  );
}

export default App;
