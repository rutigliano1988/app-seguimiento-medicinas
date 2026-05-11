import { Pill } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-8">
        <Pill className="text-emerald-500" size={28} />
        <span className="text-2xl font-bold text-slate-900">Seguimiento de Medicinas</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
