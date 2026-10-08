import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import { Link } from "react-router";
import AuthBar from "./AuthBar";

const Header = () => (
  <AppBar position="static">
    <Container maxWidth="lg">
      <Toolbar
        disableGutters
        sx={{ minHeight: 64, justifyContent: "space-between", gap: 2 }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            color: "text.primary",
            textDecoration: "none",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "grid",
              placeItems: "center",
            }}
          >
            <DescriptionOutlined fontSize="small" />
          </Box>
          <Typography
            component="span"
            sx={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em" }}
          >
            Car Dossier
          </Typography>
        </Box>
        <AuthBar />
      </Toolbar>
    </Container>
  </AppBar>
);

export default Header;
