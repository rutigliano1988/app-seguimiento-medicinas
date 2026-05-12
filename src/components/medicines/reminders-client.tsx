"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { Schedule, Medicine } from "@/generated/prisma/client";
import { utcTimeToLocal } from "@/lib/time";

type ScheduleWithMedicine = Schedule & {
  medicine: Pick<Medicine, "id" | "name" | "color">;
};

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Todos los días",
  SPECIFIC_DAYS: "Días específicos",
  EVERY_N_HOURS: "Cada N horas",
  AS_NEEDED: "Según necesidad",
};

export function RemindersClient({ schedules }: { schedules: ScheduleWithMedicine[] }) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleSchedule(id: string, isActive: boolean) {
    setToggling(id);
    const res = await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    if (!res.ok) {
      toast.error("Error al actualizar el recordatorio");
    } else {
      toast.success(isActive ? "Recordatorio activado" : "Recordatorio desactivado");
      router.refresh();
    }
    setToggling(null);
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Clock size={40} className="mx-auto mb-3 opacity-30" />
        <p>No hay recordatorios configurados.</p>
        <p className="text-sm mt-1">Agregar un horario al registrar un medicamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardContent className="flex items-center gap-4 py-4">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: schedule.medicine.color ?? "#94a3b8" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">{schedule.medicine.name}</p>
              <p className="text-sm text-slate-500">{FREQ_LABELS[schedule.frequency] ?? schedule.frequency}</p>
              {schedule.times.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {schedule.times.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      <Clock size={10} className="mr-1" />{utcTimeToLocal(t)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Switch
              checked={schedule.isActive}
              disabled={toggling === schedule.id}
              onCheckedChange={(val) => toggleSchedule(schedule.id, val)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
