"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Pill, History, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/medicines", label: "Medicamentos", icon: Pill },
  { href: "/history", label: "Historial", icon: History },
  { href: "/family", label: "Familia", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
            pathname.startsWith(href)
              ? "text-slate-900"
              : "text-slate-400"
          )}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
