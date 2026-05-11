"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  title: string;
  userEmail?: string;
}

export function Header({ title, userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
            <User size={14} />
            {userEmail}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-slate-500 hover:text-slate-900"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline ml-1.5">Salir</span>
        </Button>
      </div>
    </header>
  );
}
