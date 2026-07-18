import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { DialogProvider } from "@/context/DialogContext";
import { router } from "./router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AppDataProvider>
        <DialogProvider>
          <RouterProvider router={router} />
        </DialogProvider>
      </AppDataProvider>
    </AuthProvider>
  </StrictMode>,
);
