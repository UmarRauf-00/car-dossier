import { Box, Button, Typography } from "@mui/material";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/react-router";

// Sign in / sign up, or the signed-in user's menu. Rendered inside <Header />.
const AuthBar = () => {
  const { user, isSignedIn } = useUser();

  return (
    <Box
      component="nav"
      aria-label="Account"
      sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
    >
      {isSignedIn ? (
        <>
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "inline" } }}
          >
            Welcome, {user.firstName || user.username}
          </Typography>
          <UserButton />
        </>
      ) : (
        <>
          <SignInButton>
            <Button name="sign-in-button" variant="outlined" color="inherit">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button name="sign-up-button" variant="contained">
              Sign up
            </Button>
          </SignUpButton>
        </>
      )}
    </Box>
  );
};

export default AuthBar;
