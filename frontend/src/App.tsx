import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  defaultRadius: "xs",
  primaryColor: "green",
  fontFamily: "'IBM Plex Sans', sans-serif",
  headings: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: "600",
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="bottom-left" zIndex={1000} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
