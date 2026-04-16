import { Outlet, useLocation } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import { ChatPanel } from "../components/common/ChatPanel";
import { UserHeader } from "../components/common/UserHeader";
import { ChatProvider } from "../context/ChatContext";
import { cn } from "../lib/utils";

const SuperAdminLayout = () => {
  const location = useLocation();
  const isAIPage = location.pathname === "/ai-assistant";

  return (
    <ChatProvider>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* SuperAdmin Sidebar */}
        <SuperAdminSidebar />

        {/* Workspace Root */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation / Claims Header */}
          <UserHeader />

          {/* Main Workspace (Outlet + Side Panel) */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Main Scrollable Content */}
            <main className={cn("flex-1 overflow-y-auto relative", !isAIPage && "p-6")}>
              <Outlet />
            </main>

            {/* AI Chat Panel (Copilot-style) */}
            <ChatPanel />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
};

export default SuperAdminLayout;
