// src/components/SmartRedirect.tsx
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFirstPermittedRoute } from "../hooks/useFirstPermittedRoute";

const SmartRedirect = () => {
    debugger;
    const { getFirstRoute, isReady } = useFirstPermittedRoute();

    // ⏳ Permissions load hone tak wait karo
    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            </div>
        );
    }

    // ✅ Ab pehla permitted route pe bhejo
    const route = getFirstRoute();
    console.log("Redirecting to:", route);
    return <Navigate to={route} replace />;
};

export default SmartRedirect;