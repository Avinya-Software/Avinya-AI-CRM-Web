// src/main.tsx
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthProvider";
import { PermissionProvider } from "./context/PermissionContext";
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </PermissionProvider>
    </AuthProvider>
  </QueryClientProvider>
);
