"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserMenu } from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Car,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface ChatSession {
  id: string;
  brand: string;
  model: string;
  year: string;
  category: string;
  messageCount: number;
  createdAt: string;
  _count: {
    messages: number;
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        const data = await response.json();

        if (response.ok) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSessions();
    }
  }, [session]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus sesi chat ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    setDeletingId(sessionId);

    try {
      const response = await fetch(`/api/diagnosis/${sessionId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Remove from UI
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Sesi chat berhasil dihapus");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Gagal menghapus sesi. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
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
              <p className="text-xs text-muted-foreground">Riwayat Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Sesi Chat Anda</h2>
          <p className="text-muted-foreground">
            Lihat dan lanjutkan sesi diagnosis sebelumnya
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada sesi chat</p>
              <Button onClick={() => router.push("/")}>
                Mulai Diagnosis Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:shadow-lg transition-shadow relative group"
                onClick={() => router.push(`/chat?sessionId=${session.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        {session.brand} {session.model}
                      </CardTitle>
                      <CardDescription>
                        {session.year} • {session.category}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(session.id, e)}
                      disabled={deletingId === session.id}
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{session._count.messages} messages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(session.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.messageCount}/3 used
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
