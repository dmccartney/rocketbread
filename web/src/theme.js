import { createTheme } from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import deepOrange from "@mui/material/colors/deepOrange";
import deepPurple from "@mui/material/colors/deepPurple";
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: deepOrange,
    secondary: deepPurple,
  },
  typography: {
    code: {
      fontFamily: "monospace",
      textTransform: "none",
    },
  },
});

export default theme;
