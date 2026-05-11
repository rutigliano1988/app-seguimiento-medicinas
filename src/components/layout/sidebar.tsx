"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Pill,
  Clock,
  History,
  Package,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/medicines", label: "Medicamentos", icon: Pill },
  { href: "/reminders", label: "Recordatorios", icon: Clock },
  { href: "/history", label: "Historial", icon: History },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/family", label: "Familia", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-900 text-slate-100 p-4 gap-1">
      <div className="flex items-center gap-2 px-3 py-4 mb-2">
        <Pill className="text-emerald-400" size={22} />
        <span className="font-semibold text-lg">Medicinas</span>
      </div>

      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith(href)
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </aside>
  );
}
