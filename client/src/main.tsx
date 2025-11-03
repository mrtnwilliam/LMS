import { createRoot } from "react-dom/client";
import "./index.css";
import { AppContextProvider } from "./context/AppContext.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
    <AppContextProvider>
      <RouterProvider router={router} />
    </AppContextProvider>
  </ClerkProvider>
);
