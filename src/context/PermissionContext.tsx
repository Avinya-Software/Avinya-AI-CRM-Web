// src/context/PermissionContext.tsx
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useGetUserPermissions } from "../hooks/admin/useLoginAdmin";
import { useAuth } from "../auth/useAuth";

export type Action =
    | "view"
    | "add"
    | "edit"
    | "delete"
    | "assign"
    | "approve";

interface Permission {
    module: string;
    action: Action;
}

type PermissionContextType = {
    permissions: Permission[];
    hasPermission: (module: string, action: Action) => boolean;
    isLoading: boolean;
    isReady: boolean;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
    undefined
);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const { userId, token } = useAuth();
    const permissionMutation = useGetUserPermissions();
    const [permissionResponse, setPermissionResponse] = useState<{ data?: string[] } | undefined>(undefined);

    useEffect(() => {
        if (userId && token) {
            permissionMutation.mutate(userId, {
                onSuccess: (data) => {
                    setPermissionResponse(data);
                },
            });
        }
    }, [userId, token]);

    const rawPermissions: string[] = permissionResponse?.data ?? [];

    const permissions: Permission[] = rawPermissions.map((p) => {
        const [module, action] = p.split(":");
        return {
            module: module.toLowerCase().trim(),
            action: action.toLowerCase().trim() as Action,
        };
    });

    const hasPermission = (module: string, action: Action): boolean => {
        const normalizedModule = module.toLowerCase().trim();
        const normalizedAction = action.toLowerCase().trim();

        return permissions.some(
            (p) =>
                p.module === normalizedModule &&
                p.action === normalizedAction
        );
    };

    const isLoading = permissionMutation.isPending;
    const isReady = !isLoading && permissionResponse !== undefined;

    return (
        <PermissionContext.Provider
            value={{ permissions, hasPermission, isLoading, isReady }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error("usePermissions must be used within PermissionProvider");
    }
    return context;
};
