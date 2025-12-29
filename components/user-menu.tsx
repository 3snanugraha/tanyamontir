"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/store/useWizardStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import { Coins, LogOut, RotateCcw, MessageSquare } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const { reset } = useWizardStore();

  if (!session?.user) {
    return null;
  }

  const handleResetData = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mereset semua data diagnosis? Ini akan menghapus progress wizard Anda saat ini."
      )
    ) {
      reset();
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <UserAvatar
            name={session.user.name}
            image={session.user.image}
            className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" disabled>
          <Coins className="mr-2 h-4 w-4 text-amber-500" />
          <span className="flex-1">Kredit</span>
          <span className="font-semibold text-primary">
            {session.user.credits || 0}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/history")}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Riwayat Chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={handleResetData}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>Reset Data</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
