import { createRoot } from "react-dom/client";
import "./index.css";
import { AppContextProvider } from "./context/AppContext.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import axios from "axios";

axios.defaults.withCredentials = true;


createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <RouterProvider router={router} />
  </AppContextProvider>
);
