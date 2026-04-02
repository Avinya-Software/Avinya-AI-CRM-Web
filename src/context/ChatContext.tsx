import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage, AIRequest, AIResponse } from "../interfaces/ai.interface";
import { useAIChat } from "../hooks/ai/useAIChat";

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isPending: boolean;
  sendMessage: (content: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your Avinya AI CRM assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: mutateChat, isPending } = useAIChat();

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    mutateChat(
      { message: content },
      {
        onSuccess: (data) => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: data.message || (data.count > 0 ? `I found ${data.count} results:` : "Here is what I found:"),
            data: data.data,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
        onError: (error: any) => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: error.response?.data?.message || "Sorry, I encountered an error while processing your request.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
      }
    );
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, input, setInput, isPending, sendMessage, isOpen, setIsOpen }}>
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
