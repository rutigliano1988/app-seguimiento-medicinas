import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RemindersClient } from "@/components/medicines/reminders-client";

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const schedules = await prisma.schedule.findMany({
    where: { medicine: { userId: session.user.id, isActive: true } },
    include: { medicine: { select: { id: true, name: true, color: true } } },
    orderBy: { medicine: { name: "asc" } },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recordatorios</h2>
        <p className="text-sm text-slate-500">Activa o desactiva los horarios de tus medicamentos</p>
      </div>
      <RemindersClient schedules={schedules} />
    </div>
  );
}
