import "@mantine/charts/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { SignalRManager } from "./features/notifications/components/SignalRManager";
import { AppRoutes } from "./routes/routes";

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
        <SignalRManager />
        <AppRoutes />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
