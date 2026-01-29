// src/main.tsx
import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthProvider";
import { Provider } from "react-redux";
import { store } from "./store";
import { PermissionProvider } from "./context/PermissionContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          <PermissionProvider>
            <App />
          </PermissionProvider>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);