import React, { useRef, useEffect } from "react";
import { Bot, Send, TrendingUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from "../context/ChatContext";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const AIAssistant = () => {
  const { messages, input, setInput, isPending, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900 flex items-center gap-2">
            <Bot className="h-7 w-7 text-emerald-600" />
            AI Assistant
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Intelligent CRM help and data insights
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white" ref={scrollRef}>
        <div className="max-w-5xl mx-auto space-y-6 w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                {msg.role === "ai" ? (
                  <>
                    <Bot className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avinya AI</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">You</span>
                )}
              </div>
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm max-w-[90%] shadow-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                )}
              >
                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-0 prose-ul:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              {msg.data && msg.data.length > 0 && (msg.data.length > 1 || Object.keys(msg.data[0]).length > 1) && (
                <div className="mt-4 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-lg">
                  <DataTable data={msg.data} />
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-slate-400 text-sm italic py-2">
              <Bot className="h-6 w-6 animate-bounce text-emerald-600" />
              Avinya AI is analyzing your CRM data...
            </div>
          )}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="pb-8 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex gap-3">
          <Input
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isPending}
            className="flex-1 h-12 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 shadow-sm text-base px-5 rounded-2xl"
          />
          <Button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="h-12 w-12 bg-slate-800 hover:bg-slate-700 shadow-md rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
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
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-slate-50/50">
        {columns.map((col) => (
          <div key={col} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {formatLabel(col)}
            </span>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-lg font-bold text-slate-900 truncate",
                col.toLowerCase().includes("revenue") || col.toLowerCase().includes("total") ? "text-emerald-600" : ""
              )}>
                {formatValue(col, data[0][col])}
              </span>
              {(col.toLowerCase().includes("leads") || col.toLowerCase().includes("orders")) && (
                <TrendingUp className="h-4 w-4 text-emerald-500 opacity-50" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead key={col} className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap py-3 px-4 border-r last:border-r-0">
                {formatLabel(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col) => (
                <TableCell key={col} className="text-sm py-3 px-4 whitespace-nowrap border-r last:border-r-0 border-slate-100">
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

export default AIAssistant;
