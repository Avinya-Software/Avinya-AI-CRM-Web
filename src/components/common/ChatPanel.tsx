import React, { useRef, useEffect, useState } from "react";
import { Bot, Send, ExternalLink, X, TrendingUp, ChevronDown, ChevronUp, BarChart2, Clock, Hash, Coins, Zap, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Mic, MicOff, Users, Mail, Phone, Activity, Paperclip, FileImage } from "lucide-react";
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
import { ChatDataRenderer } from "./ChatDataRenderer";
import type { DashboardPayload, DashboardModuleData, DashboardStatusItem } from "../../interfaces/ai.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, string> = {
  Leads: "🎯",
  Clients: "👥",
  Quotations: "📄",
  Orders: "🛒",
  Expenses: "💸",
  Invoices: "🧾",
  Payments: "💳",
  Projects: "🏗️",
  TaskOccurrences: "✅",
  TaskSeries: "🔁",
  Products: "📦",
};

const MODULE_COLORS: Record<string, string> = {
  Leads: "from-violet-500 to-violet-600",
  Clients: "from-blue-500 to-blue-600",
  Quotations: "from-amber-500 to-amber-600",
  Orders: "from-green-500 to-green-600",
  Expenses: "from-red-500 to-red-600",
  Invoices: "from-orange-500 to-orange-600",
  Payments: "from-teal-500 to-teal-600",
  Projects: "from-indigo-500 to-indigo-600",
  TaskOccurrences: "from-cyan-500 to-cyan-600",
  TaskSeries: "from-sky-500 to-sky-600",
  Products: "from-pink-500 to-pink-600",
};

const formatLabel = (label: string) =>
  label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

const isCountKey = (key: string) =>
  /count|orders?|clients?|leads?|tasks?|projects?|results?|records?|qty|quantity|units?|items?/i.test(key);

const isCurrencyKey = (key: string) =>
  !isCountKey(key) &&
  /revenue|amount|price|charge|outstanding|grandtotal|balance|cost|subtotal|payment|invoice|expense|sales|profit|income|value/i.test(key);

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  const lowerKey = key.toLowerCase();

  if (
    typeof value === "number" ||
    (!isNaN(Number(value)) && typeof value === "string" && value.length > 0 && !lowerKey.includes("id") && !lowerKey.includes("no"))
  ) {
    const num = Number(value);
    if (isCurrencyKey(lowerKey)) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    }
    return num.toLocaleString();
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime()))
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { }
  }

  return String(value);
};

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

const SuggestionChips = ({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) => (
  <div className="flex flex-wrap gap-2 px-1">
    {suggestions.map((s, i) => (
      <button
        key={i}
        onClick={() => onSelect(s)}
        className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-1.5 group"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-600 transition-colors" />
        {s}
      </button>
    ))}
  </div>
);

// ─── Module Card (Compact – for sidebar) ──────────────────────────────────────

const ModuleCard = ({ module }: { module: DashboardModuleData }) => {
  const [expanded, setExpanded] = useState(false);
  const icon = MODULE_ICONS[module.name] ?? "📊";
  const gradient = MODULE_COLORS[module.name] ?? "from-slate-500 to-slate-600";
  const hasRecords = module.recentRecords.length > 0;
  const hasStatus = module.statusBreakdown.length > 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cn("bg-gradient-to-r px-3 py-2.5 flex items-center justify-between", gradient)}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-white text-[11px] font-bold uppercase tracking-wider">{formatLabel(module.name)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg px-2 py-0.5 flex items-center gap-1">
            <Hash className="h-2.5 w-2.5 text-white" />
            <span className="text-white text-xs font-bold">{module.count.toLocaleString()}</span>
          </div>
          {(hasRecords || hasStatus) && (
            <button onClick={() => setExpanded(e => !e)} className="text-white/80 hover:text-white transition-colors">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Status Breakdown Pills */}
      {hasStatus && (
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5">
          {module.statusBreakdown.slice(0, 4).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-sm">
              <span>{String(s.Status ?? "—")}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-900">{s.Count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expanded Recent Records */}
      {expanded && hasRecords && (
        <div className="divide-y divide-slate-50">
          {module.recentRecords.slice(0, 4).map((record, i) => {
            const keys = Object.keys(record).filter(k => !k.toLowerCase().includes("id") || Object.keys(record).length <= 2);
            const primary = keys[0];
            const secondary = keys[1];
            return (
              <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-700 font-medium truncate">
                    {formatValue(primary, record[primary])}
                  </span>
                </div>
                {secondary && (
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {formatValue(secondary, record[secondary])}
                  </span>
                )}
              </div>
            );
          })}
          {module.recentRecords.length > 4 && (
            <div className="px-3 py-1.5 text-[10px] text-slate-400 text-center">
              +{module.recentRecords.length - 4} more records
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Dashboard Cards Grid ─────────────────────────────────────────────────────

const DashboardCards = ({ dashboard }: { dashboard: DashboardPayload }) => {
  const modules = Object.values(dashboard);
  if (modules.length === 0) return null;

  return (
    <div className="w-full mt-2 space-y-2">
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CRM Overview</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {modules.map(m => <ModuleCard key={m.name} module={m} />)}
      </div>
    </div>
  );
};

// ─── Smart Data Table (for standard tabular results) ─────────────────────────

const DataTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const isSingleRow = data.length === 1;
  const columns = Object.keys(data[0]);
  const hasManyColumns = columns.length > 3;

  if (isSingleRow && hasManyColumns) {
    return (
      <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50/50">
        {columns.map(col => (
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
            {columns.map(col => (
              <TableHead key={col} className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap py-2 px-3 border-r last:border-r-0">
                {formatLabel(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="hover:bg-slate-50/50">
              {columns.map(col => (
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

// ─── Report Breakdown ─────────────────────────────────────────────────────────

const ReportBreakdown = ({ breakdown }: { breakdown: Record<string, Record<string, any>> }) => (
  <div className="space-y-4">
    {Object.entries(breakdown).map(([category, items]) => {
      if (!items || Object.keys(items).length === 0) return null;
      return (
        <div key={category} className="space-y-2">
          <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest pl-1 border-l-2 border-emerald-500">
            {category}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(items).map(([label, value]) => (
              <div key={label} className="bg-slate-50/80 p-2 rounded-lg border border-slate-100/50 flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 font-medium uppercase truncate">{label}</span>
                <span className="text-xs font-bold text-slate-800">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Main ChatPanel ───────────────────────────────────────────────────────────

export const ChatPanel = () => {
  const { messages, input, setInput, isPending, sendMessage, sendFeedback, isOpen, setIsOpen, remainingCredits, selectedFile, setSelectedFile } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAIPage = location.pathname === "/ai-assistant";
  const [correctionMode, setCorrectionMode] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('WebkitSpeechRecognition' in window || 'speechRecognition' in window) {
      const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [setInput]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending, isOpen]);

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    sendMessage(input, selectedFile || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFeedback = (msgId: string, isGood: boolean) => {
    if (isGood) {
      sendFeedback(msgId, true);
    } else {
      setCorrectionMode(msgId);
      setCorrectionText("");
    }
  };

  const submitCorrection = (msgId: string) => {
    sendFeedback(msgId, false, correctionText);
    setCorrectionMode(null);
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
        {/* Header */}
        <div className="p-4 border-b bg-slate-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">Avinya AI Assistant</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">Beta</span>
            </div>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col w-full animate-slideUp",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              {/* Bubble */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}
              >
                <div className={cn(
                  "prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-0 prose-ul:my-2",
                  msg.role === "user" ? "prose-invert" : ""
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Breakdown */}
                {msg.breakdown && (
                  <div className="mt-3 space-y-3">
                    <ReportBreakdown breakdown={msg.breakdown} />
                  </div>
                )}

                {/* Insights */}
                {msg.insights && (
                  <div className="mt-3 border-t pt-3 flex items-start gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] leading-relaxed text-slate-600 italic">
                      <span className="font-bold text-slate-900 not-italic mr-1">Insights:</span>
                      {msg.insights}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard Cards (multi-module summary) */}
              {msg.dashboardData && (
                <div className="mt-2 w-full">
                  <DashboardCards dashboard={msg.dashboardData} />
                </div>
              )}

              {/* Structured query results */}
              {!msg.dashboardData && !msg.universalDashboard && msg.data !== undefined && (
                <div className="mt-2 w-full">
                  <ChatDataRenderer data={msg.data} compact />
                </div>
              )}

              {/* CLARIFICATION / SUGGESTED CLIENTS */}
              {msg.role === "ai" && msg.id === messages[messages.length - 1].id && (
                <div className="w-full space-y-3 mt-2">
                  {messages.find(m => m.id === msg.id)?.data?.some(d => d.ClientID) && (
                    <div className="grid grid-cols-1 gap-2 animate-slideUp">
                      {messages.find(m => m.id === msg.id)?.data?.filter(d => d.ClientID).map((client, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(`Use client: ${client.CompanyName}`)}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-bold text-xs text-slate-700 group-hover:text-emerald-700">{client.CompanyName}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {client.Email && (
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                <Mail className="h-2.5 w-2.5" />
                                <span>{client.Email}</span>
                              </div>
                            )}
                            {client.Mobile && (
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                <Phone className="h-2.5 w-2.5" />
                                <span>{client.Mobile}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between w-full mt-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {msg.role === "ai" && msg.query && (
                    <div className="flex items-center gap-1">
                      {msg.feedbackGiven === "good" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : msg.feedbackGiven === "bad" ? (
                        <XCircle className="h-3 w-3 text-rose-500" />
                      ) : (
                        <>
                          <button 
                            onClick={() => handleFeedback(msg.id, true)}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <ThumbsUp className="h-2.5 w-2.5" />
                          </button>
                          <button 
                            onClick={() => handleFeedback(msg.id, false)}
                            className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <ThumbsDown className="h-2.5 w-2.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "ai" && msg.creditsUsed !== undefined && (
                  <div className="flex items-center gap-1.5 bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-100">
                    <Zap className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-500">
                      {msg.creditsUsed.toLocaleString()} credits
                    </span>
                  </div>
                )}
              </div>

              {/* CORRECTION INPUT */}
              {correctionMode === msg.id && (
                <div className="mt-2 w-full animate-scaleIn">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">What was wrong?</p>
                    <div className="flex gap-1.5">
                      <Input 
                        value={correctionText}
                        onChange={(e) => setCorrectionText(e.target.value)}
                        placeholder="Explain or fix..."
                        maxLength={800}
                        className="h-8 text-xs bg-white border-slate-200 focus-visible:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && submitCorrection(msg.id)}
                      />
                      <Button 
                        onClick={() => submitCorrection(msg.id)}
                        className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px]"
                      >
                        Send
                      </Button>
                      <Button 
                        onClick={() => setCorrectionMode(null)}
                        variant="outline"
                        className="h-8 px-2 text-[10px]"
                      >
                        X
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 w-full animate-slideUp">
                  <SuggestionChips suggestions={msg.suggestions} onSelect={setInput} />
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white/50 py-2 px-3 rounded-full border border-slate-100 self-start">
              <Bot className="h-4 w-4 animate-bounce text-emerald-500" />
              Avinya AI is processing...
            </div>
          )}
        </div>

        {/* Remaining Credits */}
        {remainingCredits !== null && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Credits Balance</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-black text-slate-800 tracking-tight">
                {remainingCredits.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">CREDITS</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] shrink-0">
          {selectedFile && (
            <div className="mb-2 flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-slideUp">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileImage className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-medium text-emerald-700 truncate">{selectedFile.name}</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="icon"
              className="border-slate-200 hover:bg-slate-50 rounded-xl h-11 w-11 shrink-0 text-slate-400 hover:text-emerald-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              title="Upload receipt for expense creation"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isPending}
              maxLength={800}
              className="flex-1 border-slate-200 focus-visible:ring-emerald-500 rounded-xl bg-slate-50/50 h-11"
            />
            <Button
              onClick={handleSend}
              disabled={isPending || (!input.trim() && !selectedFile)}
              className="bg-slate-800 hover:bg-slate-700 shadow-lg rounded-xl h-11 w-11 p-0 transition-all hover:scale-105 active:scale-95 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
