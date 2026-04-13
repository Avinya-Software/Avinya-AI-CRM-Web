// src/hooks/useFirstPermittedRoute.ts
import { usePermissions } from "../context/PermissionContext";

const MODULE_ROUTE_MAP: { module: string; route: string }[] = [
  { module: "dashboard", route: "/" },
  { module: "lead", route: "/leads" },
  { module: "quotation", route: "/quotations" },
  { module: "user", route: "/users" },
  { module: "client", route: "/clients" },
  { module: "task", route: "/tasks" },
  { module: "team", route: "/teams" },
  { module: "order", route: "/orders" },
  { module: "project", route: "/projects" },
  { module: "expense", route: "/expenses" },
  { module: "campaign", route: "/campaign" },
  { module: "settings", route: "/settings" },
];

export const useFirstPermittedRoute = () => {
  const { hasPermission, isReady } = usePermissions();

  const getFirstRoute = (): string => {
    for (const { module, route } of MODULE_ROUTE_MAP) {
      if (hasPermission(module, "view")) return route;
    }
    return "/unauthorized";
  };


  return { getFirstRoute, isReady };
};