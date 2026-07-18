import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import WelcomePage from "./components/WelcomePage";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/react-router";

function App() {
  const { user, isSignedIn } = useUser();

  return (
    <>
      <AppBar
        position="static"
        sx={{
          maxWidth: "14rem",
          position: "absolute",
          right: "49px",
          top: "236px",
          background: "linear-gradient(#FFFFFF10, #FFFFFF80)",
          boxShadow: "none",
          border: "none",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {isSignedIn ? (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography component="span" variant="body2">
                  Welcome, {user.firstName || user.username}
                </Typography>
                <UserButton />
              </Box>
            ) : (
              <>
                <SignInButton>
                  <Button
                    name="sign-in-button"
                    variant="contained"
                    size="small"
                    // sx={{ background: "#175ca0", color: "#FFFFFF" }}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    name="sign-up-button"
                    variant="contained"
                    size="small"
                    // sx={{ background: "#175ca0", color: "#FFFFFF" }}
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
