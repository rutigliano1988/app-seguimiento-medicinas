import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Package, Pill } from "lucide-react";
import type { Medicine, Schedule, Inventory } from "@/generated/prisma/client";

type MedicineWithRelations = Medicine & {
  schedules: Schedule[];
  inventory: Inventory | null;
};

const FORM_LABELS: Record<string, string> = {
  TABLET: "Pastilla",
  CAPSULE: "Cápsula",
  LIQUID: "Líquido",
  INJECTION: "Inyección",
  CREAM: "Crema",
  DROPS: "Gotas",
  INHALER: "Inhalador",
  PATCH: "Parche",
  OTHER: "Otro",
};

export function MedicineList({ medicines }: { medicines: MedicineWithRelations[] }) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Pill size={40} className="mx-auto mb-3 opacity-30" />
        <p>No tienes medicamentos registrados.</p>
        <p className="text-sm mt-1">
          <Link href="/medicines/new" className="text-emerald-600 hover:underline">
            Agregar el primero
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medicines.map((med) => (
        <Link key={med.id} href={`/medicines/${med.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: med.color ?? "#94a3b8" }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{med.name}</p>
                <p className="text-sm text-slate-500">
                  {med.dosage} · {FORM_LABELS[med.form] ?? med.form}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {med.schedules.length > 0 ? (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    <Clock size={11} className="mr-1" />
                    {med.schedules[0].times.join(", ")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400">Sin horario</Badge>
                )}
                {med.inventory && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Package size={11} />
                    {med.inventory.currentStock} {med.inventory.unit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
