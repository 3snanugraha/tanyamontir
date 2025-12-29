"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMenu } from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  Loader2,
  Copy,
  Check,
  ArrowDown,
  Mic,
  MicOff,
} from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatSession {
  id: string;
  brand: string;
  model: string;
  year: string;
  odometer: string;
  transmission: string;
  fuel: string;
  category: string;
  symptoms: string[];
  answers: Record<string, string>;
  messageCount: number;
  messages: Message[];
}

const MAX_MESSAGES = 3;

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sessionId = searchParams.get("sessionId");

  const [mounted, setMounted] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoAnalyzed = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);

    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "id-ID";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + (prev ? " " : "") + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Load chat session from database
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        // No sessionId in URL, redirect to home
        router.push("/");
        return;
      }

      if (!mounted) return;

      try {
        const response = await fetch(`/api/diagnosis/${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load session");
        }

        setChatSession(data.session);
        setMessages(data.session.messages || []);
        setLoadingSession(false);
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Gagal memuat sesi diagnosis");
        router.push("/");
      }
    };

    loadSession();
  }, [sessionId, mounted, router]);

  // Auto-analyze on first load
  useEffect(() => {
    if (
      !hasAutoAnalyzed.current &&
      chatSession &&
      messages.length === 0 &&
      !loadingSession
    ) {
      hasAutoAnalyzed.current = true;
      sendMessage(
        "Mohon analisa lengkap masalah kendaraan saya berdasarkan data yang sudah saya berikan. Berikan diagnosa, kemungkinan penyebab, dan solusi yang disarankan."
      );
    }
  }, [chatSession, messages.length, loadingSession]);

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

  // Detect scroll position
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

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

  const constructSystemContext = () => {
    if (!chatSession) return "";

    return `
Data Kendaraan:
- Merek/Model: ${chatSession.brand} ${chatSession.model} (${chatSession.year})
- KM: ${chatSession.odometer}
- Transmisi: ${chatSession.transmission}
- BBM: ${chatSession.fuel}

Masalah Utama: ${chatSession.category}

Keluhan Awal:
${chatSession.symptoms.map((s) => `- ${s}`).join("\n")}

Gejala Detail (Q&A):
${Object.entries(chatSession.answers)
  .map(([q, a]) => `- ${q}: ${a}`)
  .join("\n")}
`;
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !chatSession) return;

    // Check message limit
    if (chatSession.messageCount >= MAX_MESSAGES) {
      toast.warning(
        `Batas sesi tercapai (${MAX_MESSAGES} pesan). Silakan mulai diagnosis baru.`
      );
      return;
    }

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
          sessionId: chatSession.id,
          messages: [
            {
              role: "system",
              content: `System Context: ${constructSystemContext()}`,
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
            m.id === assistantId
              ? {
                  ...m,
                  content: assistantMessage || "Menganalisa...",
                }
              : m
          )
        );
      }

      // Update message count in session
      setChatSession((prev) =>
        prev ? { ...prev, messageCount: prev.messageCount + 1 } : null
      );
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

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition tidak didukung di browser ini.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
      }
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin kembali ke beranda? Sesi chat akan tetap tersimpan."
      )
    ) {
      router.push("/");
    }
  };

  if (!mounted || loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Session not found</p>
      </div>
    );
  }

  const messagesRemaining = MAX_MESSAGES - chatSession.messageCount;
  const isSessionLimitReached = chatSession.messageCount >= MAX_MESSAGES;

  return (
    <div className="flex h-screen flex-col">
      {/* Header - Fixed Top */}
      <div className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
                {chatSession.brand} {chatSession.model} - {messagesRemaining}{" "}
                pesan tersisa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 pt-20 pb-24">
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
                      className="absolute -top-0.5 -right-0.5 h-8 px-1.5 py-0.5 text-[10px] opacity-50 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => copyToClipboard(m.content, m.id)}
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="h-2.5 w-2.5 mr-0.5" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-2.5 w-2.5 mr-0.5" />
                          Salin
                        </>
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
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm mt-1 mb-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
        {isSessionLimitReached ? (
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                Batas sesi tercapai ({MAX_MESSAGES} pesan)
              </p>
              <p className="text-xs text-muted-foreground">
                Lanjutkan chat dengan menggunakan 1 kredit, atau mulai diagnosis
                baru
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!chatSession) return;

                  // Check if user has credits
                  const creditsResponse = await fetch("/api/credits/check");
                  const creditsData = await creditsResponse.json();

                  if (creditsData.credits < 1) {
                    toast.error(
                      "Kredit tidak cukup. Silakan mulai diagnosis baru atau beli kredit."
                    );
                    return;
                  }

                  // Confirm credit usage
                  if (
                    !confirm(
                      "Gunakan 1 kredit untuk melanjutkan percakapan ini untuk 3 pesan lagi?"
                    )
                  ) {
                    return;
                  }

                  try {
                    // Deduct credit and reset message count
                    const response = await fetch("/api/credits/deduct", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        amount: 1,
                        action: "chat",
                        sessionId: chatSession.id,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to deduct credit");
                    }

                    // Reset message count in session
                    await fetch(
                      `/api/diagnosis/${chatSession.id}/reset-count`,
                      {
                        method: "POST",
                      }
                    );

                    // Reload session
                    window.location.reload();
                  } catch (error) {
                    console.error("Error continuing session:", error);
                    toast.error("Gagal melanjutkan sesi. Silakan coba lagi.");
                  }
                }}
                variant="default"
                className="flex-1"
              >
                Lanjutkan dengan 1 Kredit
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                Mulai Diagnosis Baru
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-center gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Tanyakan detail solusi atau estimasi biaya..."
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              autoFocus
              disabled={isLoading}
              rows={1}
            />
            <Button
              type="button"
              size="icon"
              variant={isListening ? "default" : "outline"}
              onClick={toggleVoiceRecognition}
              disabled={isLoading}
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
