import { Navigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionContext";
import { Loader2 } from "lucide-react";
import type { Action } from "../context/PermissionContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  module: string;
  action?: Action;
};

export const ProtectedRoute = ({
  children,
  module,
  action = "view",
}: ProtectedRouteProps) => {
  const { hasPermission, isLoading, isReady } = usePermissions();

  // 🔄 Still loading permissions → WAIT
  if (!isReady || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // ❌ Only AFTER permissions are ready → decide
  if (!hasPermission(module, action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Allowed
  return <>{children}</>;
};
