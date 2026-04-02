import React from "react";
import { Bot, User, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { decodeUserToken } from "../../lib/auth.utils";
import { useChat } from "../../context/ChatContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export const UserHeader = () => {
  const { token } = useAuth();
  const { isOpen, setIsOpen } = useChat();
  const user = decodeUserToken(token);

  if (!user) return null;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-40 shadow-xl transition-all duration-300">
      <div /> 
      <div className="flex items-center gap-4">
        {/* AI Portal Trigger */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className={cn(
            "h-10 px-4 gap-2.5 rounded-xl transition-all duration-300 border font-bold relative group",
            isOpen 
              ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-700" 
              : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          )}
        >
          <Bot className={cn(
            "h-5 w-5 transition-transform duration-500",
            isOpen ? "rotate-[360deg] scale-110" : "group-hover:scale-110"
          )} />
          <span>
            {isOpen ? "Close AI Copilot" : "Ask Avinya AI"}
          </span>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full absolute top-2 right-2",
            isOpen ? "bg-white animate-pulse" : "bg-emerald-500"
          )} />
        </Button>

        <div className="h-8 w-px bg-slate-800 mx-1" />

        {/* User Info on the Right */}
        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end">
            <div className="px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/30 mb-1 shadow-sm">
              {user.role}
            </div>
            <span className="text-xs font-medium text-slate-400 leading-none">{user.email}</span>
          </div>
          
          <div className="flex items-center gap-1 p-1 rounded-xl cursor-pointer transition-colors group">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 font-bold group-hover:border-slate-500 shadow-sm transition-all group-hover:scale-105 active:scale-95">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
