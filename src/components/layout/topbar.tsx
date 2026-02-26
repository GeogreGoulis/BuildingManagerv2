"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Role } from "@/generated/prisma";

interface TopbarProps {
  userName: string;
  userRole: Role;
  onMenuToggle: () => void;
}

export function Topbar({ userName, userRole, onMenuToggle }: TopbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block" />

      <div className="relative flex items-center gap-3">
        <Badge variant="secondary">{userRole}</Badge>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{userName}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-card p-1 shadow-lg">
              <Link
                href="/profile"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => setShowDropdown(false)}
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
