import { createTheme } from "@mui/material/styles";

// "Record sheet" look: cool grey page, white cards, one blue accent,
// IBM Plex Sans for text and IBM Plex Mono for IDs and labels.
export const colors = {
  accent: "#1B5FA8",
  accentDark: "#134680",
  accentSoft: "#E8F0FA",
  page: "#F5F6F8",
  surface: "#FFFFFF",
  text: "#15181C",
  muted: "#545B66",
  border: "#E3E6EB",
  rowBorder: "#EEF0F3",
  inputBorder: "#D5D9E0",
};

export const monoFont = "'IBM Plex Mono', ui-monospace, monospace";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.accent,
      dark: colors.accentDark,
      light: colors.accentSoft,
      contrastText: "#FFFFFF",
    },
    background: { default: colors.page, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.muted },
    divider: colors.border,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    h1: {
      fontSize: "2.75rem",
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: { fontSize: "1.125rem", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 500 },
    // Small uppercase mono label above headings ("NHTSA vehicle records")
    overline: {
      fontFamily: monoFont,
      fontSize: "0.8125rem",
      letterSpacing: "0.08em",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.inputBorder,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: colors.rowBorder, fontSize: "0.9375rem" },
        head: {
          backgroundColor: colors.surface,
          color: colors.muted,
          fontSize: "0.8125rem",
          fontWeight: 500,
          borderBottomColor: colors.border,
        },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 500 } },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          backgroundColor: colors.accentSoft,
          borderColor: "#C9DAF0",
          color: colors.accentDark,
        },
      },
    },
  },
});
