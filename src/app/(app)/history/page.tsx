import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { DoseStatus } from "@/generated/prisma/client";

function StatusBadge({ status }: { status: DoseStatus }) {
  if (status === "TAKEN") return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
      <CheckCircle2 size={11} className="mr-1" /> Tomada
    </Badge>
  );
  if (status === "SKIPPED") return (
    <Badge variant="outline" className="text-slate-400">
      <XCircle size={11} className="mr-1" /> Omitida
    </Badge>
  );
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
      <Clock size={11} className="mr-1" /> Tarde
    </Badge>
  );
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const logs = await prisma.doseLog.findMany({
    where: { userId: session.user.id },
    include: { medicine: { select: { name: true, color: true } } },
    orderBy: { takenAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Historial de tomas</h2>
        <p className="text-sm text-slate-500">Últimas {logs.length} registros</p>
      </div>

      {logs.length === 0 ? (
        <p className="text-center py-12 text-slate-400">No hay registros todavía.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: log.medicine.color ?? "#94a3b8" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900">{log.medicine.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.takenAt).toLocaleString("es-AR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <StatusBadge status={log.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
