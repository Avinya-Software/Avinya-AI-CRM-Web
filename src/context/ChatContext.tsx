import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ChatMessage, AIRequest, AIResponse, DashboardPayload, AIFeedback } from "../interfaces/ai.interface";
import { useAIChat, useAIFeedback } from "../hooks/ai/useAIChat";
import { robustParseJson, parseDashboardPayload, generateMarkdownReport, normalizeChatData, getErrorMessage } from "../lib/chat-utils";

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isPending: boolean;
  sendMessage: (content: string, file?: File) => void;
  sendFeedback: (messageId: string, isGood: boolean, correction?: string) => Promise<void>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  remainingCredits: number | null;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your Avinya AI CRM assistant. I can provide you with information and insights across all your data. You get 30 credits as free daily, for more please purchase. How can I help you today?\n\nYou can create Leads, Tasks, and Expenses using AI. You can also give feedback if the AI gives a wrong response.",
      suggestions: [
        "Show my leads",
        "How is my business doing?",
        "Show my followups for today",
        "Add a new lead",
        "Show latest leads"
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: mutateChat, isPending } = useAIChat();
  const { mutateAsync: mutateFeedback } = useAIFeedback();

  const parseAIResponse = (data: AIResponse, originalContent: string): ChatMessage => {
    // Attempt to detect a multi-module dashboard response
    let dashboardData: DashboardPayload | undefined = undefined;
    let universalDashboard: any = undefined;
    let generatedContent: string | undefined = undefined;

    const dataArray = Array.isArray(data.data) ? data.data : [];

    if (dataArray.length === 1) {
      const row = dataArray[0];
      if (row.JsonResult && typeof row.JsonResult === "string") {
        const parsed = robustParseJson(row.JsonResult);
        if (parsed) {
          if (Array.isArray(parsed)) {
            data.data = parsed;
          } else {
            universalDashboard = parsed;
            generatedContent = generateMarkdownReport(universalDashboard);
          }
        }
      } else {
        const parsed = parseDashboardPayload(row);
        if (parsed) dashboardData = parsed;
      }
    }

    const normalizedPayload = (dashboardData || universalDashboard)
      ? undefined
      : normalizeChatData(
        (data.suggestedClients && data.suggestedClients.length > 0)
          ? data.suggestedClients
          : data.data
      );

    return {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: generatedContent
        || data.clarificationMessage
        || data.summary
        || data.message
        || (dashboardData
          ? `Here's your CRM overview across ${Object.keys(dashboardData).length} modules:`
          : data.count !== undefined && data.count > 0
            ? `I found ${data.count} results:`
            : "No records found."),
      data: normalizedPayload,
      summary: data.summary,
      insights: data.insights,
      suggestions: data.suggestions,
      dashboardData,
      universalDashboard,
      creditsUsed: data.creditsUsed,
      timestamp: new Date(),
      query: data.query || data.sql,
      originalMessage: originalContent,
      action: data.action,
      parameters: data.parameters,
    };
  };

  const sendFeedback = async (messageId: string, isGood: boolean, correction?: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.query || !msg.originalMessage) return;

    try {
      const feedback: AIFeedback = {
        originalMessage: msg.originalMessage,
        generatedSql: msg.query,
        isGood,
        userCorrection: correction
      };

      const result = await mutateFeedback(feedback);

      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, feedbackGiven: isGood ? "good" : "bad" }
          : m
      ));

      if (!isGood && result.success && result.sql && result.data) {
        const correctedMessage = parseAIResponse(result as AIResponse, msg.originalMessage);
        correctedMessage.isCorrection = true;
        correctedMessage.content = `[Correction] ${correctedMessage.content}`;

        if (result.remainingCredits !== undefined) {
          setRemainingCredits(result.remainingCredits);
        }

        setMessages(prev => [...prev, correctedMessage]);
      }
    } catch (err) {
      console.error("Failed to send feedback", err);
    }
  };

  const sendMessage = (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const fileToUpload = file || selectedFile;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content || (fileToUpload ? "[Image Uploaded]" : ""),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFile(null);

    const history = messages.slice(-5).map(m => ({
      role: m.role === "ai" ? "assistant" as const : "user" as const,
      content: m.content
    }));

    mutateChat(
      { message: content, history, receiptFile: fileToUpload || undefined },
      {
        onSuccess: (data: AIResponse) => {
          const aiMessage = parseAIResponse(data, content);
          if (data.remainingCredits !== undefined) {
            setRemainingCredits(data.remainingCredits);
          }
          setMessages((prev) => [...prev, aiMessage]);
        },
        onError: (error: any) => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: getErrorMessage(error),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
      }
    );
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, input, setInput, isPending, sendMessage, sendFeedback, isOpen, setIsOpen, remainingCredits, selectedFile, setSelectedFile }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
