"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    // Single name: return first letter
    return words[0][0].toUpperCase();
  }

  // Multiple names: return first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = name ? getInitials(name) : "?";

  return (
    <Avatar className={className}>
      <AvatarImage src={image || undefined} alt={name || "User"} />
      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
