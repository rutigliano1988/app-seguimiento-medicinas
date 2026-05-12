"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import type { TodayDose } from "@/types";
import { cn } from "@/lib/utils";
import { formatLocalTime } from "@/lib/time";

function DoseCard({ dose }: { dose: TodayDose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const isLate = dose.status === "PENDING" && dose.scheduledAt < now;

  async function markDose(status: "TAKEN" | "SKIPPED") {
    setLoading(true);
    const res = await fetch("/api/dose-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId: dose.medicineId,
        scheduleId: dose.scheduleId,
        scheduledAt: dose.scheduledAt.toISOString(),
        status,
      }),
    });

    if (!res.ok) {
      toast.error("Error al registrar la dosis");
      setLoading(false);
      return;
    }

    toast.success(status === "TAKEN" ? "Dosis registrada" : "Dosis omitida");
    router.refresh();
    setLoading(false);
  }

  return (
    <Card className={cn(
      "transition-colors",
      dose.status === "TAKEN" && "opacity-60",
      dose.status === "SKIPPED" && "opacity-50",
    )}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: dose.medicineColor ?? "#94a3b8" }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{dose.medicineName}</p>
          <p className="text-sm text-slate-500">{dose.dosage}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-sm font-medium", isLate ? "text-amber-600" : "text-slate-500")}>
            {formatLocalTime(dose.scheduledTime)}
          </span>

          {dose.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => markDose("SKIPPED")}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={14} />
              </Button>
              <Button
                size="sm"
                onClick={() => markDose("TAKEN")}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <CheckCircle2 size={14} className="mr-1" />
                Tomar
              </Button>
            </>
          )}

          {dose.status === "TAKEN" && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <CheckCircle2 size={12} className="mr-1" /> Tomada
            </Badge>
          )}
          {dose.status === "SKIPPED" && (
            <Badge variant="outline" className="text-slate-400">
              <XCircle size={12} className="mr-1" /> Omitida
            </Badge>
          )}
          {dose.status === "LATE" && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              <Clock size={12} className="mr-1" /> Tarde
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TodayDoses({ doses }: { doses: TodayDose[] }) {
  if (doses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Circle size={40} className="mx-auto mb-3 opacity-30" />
        <p>No hay medicamentos programados para hoy.</p>
        <p className="text-sm mt-1">
          <a href="/medicines/new" className="text-emerald-600 hover:underline">Agregar un medicamento</a>
        </p>
      </div>
    );
  }

  const pending = doses.filter((d) => d.status === "PENDING");
  const done = doses.filter((d) => d.status !== "PENDING");

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((dose, i) => (
            <DoseCard key={`${dose.scheduleId}-${dose.scheduledTime}-${i}`} dose={dose} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Completadas</p>
          {done.map((dose, i) => (
            <DoseCard key={`${dose.scheduleId}-${dose.scheduledTime}-done-${i}`} dose={dose} />
          ))}
        </div>
      )}
    </div>
  );
}
