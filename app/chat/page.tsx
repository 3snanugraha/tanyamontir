"use client";

import { useEffect, useState, useRef } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RotateCcw,
  Send,
  User,
  Bot,
  Loader2,
  Copy,
  Check,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const {
    vehicleData,
    selectedCategory,
    answers,
    symptoms,
    isCompleted,
    reset,
  } = useWizardStore();

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoAnalyzed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Construct system context from wizard data
  const systemContext = `
Data Kendaraan:
- Merek/Model: ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year})
- KM: ${vehicleData.odometer}
- Transmisi: ${vehicleData.transmission}
- BBM: ${vehicleData.fuel}

Masalah Utama: ${selectedCategory}

Keluhan Awal:
${symptoms.map((s) => `- ${s}`).join("\n")}

Gejala Detail (Q&A):
${Object.entries(answers)
  .map(([q, a]) => `- ${q}: ${a}`)
  .join("\n")}
`;

  // Chat session key for localStorage
  const CHAT_SESSION_KEY = "tanyamontir-chat-session";
  const CHAT_ANALYZED_KEY = "tanyamontir-chat-analyzed";

  // Load chat session from localStorage
  useEffect(() => {
    if (mounted) {
      const savedMessages = localStorage.getItem(CHAT_SESSION_KEY);
      const hasAnalyzed = localStorage.getItem(CHAT_ANALYZED_KEY);

      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
          if (hasAnalyzed === "true") {
            hasAutoAnalyzed.current = true;
          }
        } catch (error) {
          console.error("Failed to load chat session:", error);
          // Initialize with welcome message if load fails
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "Analyzing your vehicle issue...",
            },
          ]);
        }
      } else {
        // Initialize with welcome message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Analyzing your vehicle issue...",
          },
        ]);
      }
    }
  }, [mounted]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (mounted && messages.length > 0) {
      localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(messages));
    }
  }, [messages, mounted]);

  // Save analyzed state
  useEffect(() => {
    if (hasAutoAnalyzed.current) {
      localStorage.setItem(CHAT_ANALYZED_KEY, "true");
    }
  }, []);

  // Auto-analyze on mount
  useEffect(() => {
    if (
      mounted &&
      isCompleted &&
      !hasAutoAnalyzed.current &&
      messages.length > 0 &&
      messages.length === 1 // Only auto-analyze if just welcome message
    ) {
      hasAutoAnalyzed.current = true;
      sendMessage(
        "Mohon analisa lengkap masalah kendaraan saya berdasarkan data yang sudah saya berikan. Berikan diagnosa, kemungkinan penyebab, dan solusi yang disarankan."
      );
    }
  }, [mounted, isCompleted, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Detect scroll position to show/hide jump button
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // ScrollArea creates a viewport div, we need to target that
    const viewport = scrollContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 2);
    };

    viewport.addEventListener("scroll", handleScroll);
    // Also check on mount
    handleScroll();

    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `System Context: ${systemContext}`,
            },
            ...messages.filter((m) => m.role !== "system"),
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantMessage } : m
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus data diagnosa dan memulai ulang?"
      )
    ) {
      // Clear chat session from localStorage
      localStorage.removeItem(CHAT_SESSION_KEY);
      localStorage.removeItem(CHAT_ANALYZED_KEY);

      // Reset wizard data
      reset();
      router.push("/");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="TanyaMontir"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-foreground">Tanya</span>
                <span className="text-primary">Montir</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Konsultasi AI - {vehicleData.brand} {vehicleData.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 pb-24">
        <div className="mx-auto max-w-3xl space-y-4 px-2 sm:px-0 p-4">
          {messages
            .filter((m) => m.role !== "system")
            .map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 sm:gap-3 group ${
                  m.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] relative">
                  {m.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => copyToClipboard(m.content, m.id)}
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                      m.role === "assistant"
                        ? "bg-primary/10 text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 ml-4 list-disc">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2 ml-4 list-decimal">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }: React.HTMLAttributes<HTMLElement> & {
                            inline?: boolean;
                            node?: unknown;
                          }) =>
                            inline ? (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                                {children}
                              </code>
                            ),
                          pre: ({ children }) => (
                            <pre className="mb-2">{children}</pre>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold mb-1">
                              {children}
                            </h3>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary/30 pl-3 italic my-2">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Jump to Bottom Button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-28 right-6 h-10 w-10 rounded-full shadow-lg z-20 animate-in fade-in slide-in-from-bottom-2"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}

      {/* Input Area - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 z-10">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Tanyakan detail solusi atau estimasi biaya..."
            className="flex-1"
            autoFocus
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
