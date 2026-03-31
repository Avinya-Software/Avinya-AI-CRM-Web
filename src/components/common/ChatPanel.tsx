import React, { useRef, useEffect, useState } from "react";
import { Bot, Send, ExternalLink, X, TrendingUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useChat } from "../../context/ChatContext";
import { cn } from "../../lib/utils";

export const ChatPanel = () => {
  const { messages, input, setInput, isPending, sendMessage, isOpen, setIsOpen } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAIPage = location.pathname === "/ai-assistant";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
  };

  const handleExpand = () => {
    setIsOpen(false);
    navigate("/ai-assistant");
  };

  if (isAIPage) return null;

  return (
    <>
      {/* Copilot Sidebar Panel */}
      <div
        className={cn(
          "h-full bg-white border-l border-slate-200 shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
          isOpen ? "w-[450px]" : "w-0 border-l-0"
        )}
      >
        <div className="p-4 border-b bg-slate-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-semibold">Avinya AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-emerald-700 hover:text-white rounded-full transition-colors"
              onClick={handleExpand}
              title="Open Full Page"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-emerald-700 hover:text-white rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
              title="Close Panel"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}
              >
                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-0 prose-ul:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              {msg.data && msg.data.length > 0 && (msg.data.length > 1 || Object.keys(msg.data[0]).length > 1) && (
                <div className="mt-2 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-lg">
                  <DataTable data={msg.data} />
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white/50 py-2 px-3 rounded-full border border-slate-100 self-start">
              <Bot className="h-4 w-4 animate-bounce text-emerald-500" />
              Avinya AI is processing...
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] flex gap-2 shrink-0">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isPending}
            className="flex-1 border-slate-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50 h-11"
          />
          <Button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="bg-slate-800 hover:bg-slate-700 shadow-lg rounded-xl h-11 w-11 p-0 transition-all hover:scale-105 active:scale-95 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

const formatLabel = (label: string) => {
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (key: string, value: any) => {
  if (value === null || value === undefined) return "-";

  const lowerKey = key.toLowerCase();

  // Currency
  if (
    typeof value === "number" || 
    (!isNaN(Number(value)) && typeof value === "string" && value.length > 0 && !lowerKey.includes("id") && !lowerKey.includes("no"))
  ) {
    const num = Number(value);
    if (
      lowerKey.includes("revenue") || 
      lowerKey.includes("amount") || 
      lowerKey.includes("price") || 
      lowerKey.includes("total") ||
      lowerKey.includes("charge")
    ) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    }
    return num.toLocaleString();
  }

  // Date
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (e) { }
  }

  return String(value);
};

const DataTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const isSingleRow = data.length === 1;
  const columns = Object.keys(data[0]);
  const hasManyColumns = columns.length > 3;

  // Single row dashboard view
  if (isSingleRow && hasManyColumns) {
    return (
      <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50/50">
        {columns.map((col) => (
          <div key={col} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-sans">
              {formatLabel(col)}
            </span>
            <span className={cn(
              "text-sm font-semibold text-slate-900 truncate",
              col.toLowerCase().includes("revenue") || col.toLowerCase().includes("total") ? "text-emerald-600" : ""
            )}>
              {formatValue(col, data[0][col])}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead key={col} className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap py-2 px-3 border-r last:border-r-0">
                {formatLabel(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="hover:bg-slate-50/50">
              {columns.map((col) => (
                <TableCell key={col} className="text-[11px] py-1.5 px-3 whitespace-nowrap border-r last:border-r-0 border-slate-100">
                  {formatValue(col, row[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
