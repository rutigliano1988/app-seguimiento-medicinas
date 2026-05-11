import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TodayDoses } from "@/components/dashboard/today-doses";
import { PushPermissionBanner } from "@/components/notifications/push-permission-banner";
import type { TodayDose } from "@/types";

async function getTodayDoses(userId: string): Promise<TodayDose[]> {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);

  const schedules = await prisma.schedule.findMany({
    where: {
      isActive: true,
      medicine: { userId, isActive: true },
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: todayStart } }],
    },
    include: {
      medicine: { select: { id: true, name: true, color: true, form: true, dosage: true } },
      doseLogs: {
        where: { scheduledAt: { gte: todayStart, lt: todayEnd } },
      },
    },
  });

  const dayOfWeek = now.getUTCDay();
  const doses: TodayDose[] = [];

  for (const schedule of schedules) {
    if (
      schedule.frequency === "SPECIFIC_DAYS" &&
      schedule.daysOfWeek.length > 0 &&
      !schedule.daysOfWeek.includes(dayOfWeek)
    ) {
      continue;
    }

    for (const time of schedule.times) {
      const [hh, mm] = time.split(":").map(Number);
      const scheduledAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm));

      const log = schedule.doseLogs.find((l) => {
        if (!l.scheduledAt) return false;
        return Math.abs(l.scheduledAt.getTime() - scheduledAt.getTime()) < 120_000;
      });

      doses.push({
        scheduleId: schedule.id,
        medicineId: schedule.medicine.id,
        medicineName: schedule.medicine.name,
        medicineColor: schedule.medicine.color,
        medicineForm: schedule.medicine.form,
        dosage: schedule.medicine.dosage,
        scheduledTime: time,
        scheduledAt,
        status: log ? log.status : "PENDING",
        logId: log?.id,
      });
    }
  }

  return doses.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const doses = await getTodayDoses(session.user.id);

  const pending = doses.filter((d) => d.status === "PENDING");
  const done = doses.filter((d) => d.status !== "PENDING");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PushPermissionBanner />

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Hoy</h2>
        <p className="text-sm text-slate-500">
          {pending.length === 0
            ? "¡Todo al día! No tienes dosis pendientes."
            : `${pending.length} dosis pendiente${pending.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <TodayDoses doses={doses} />
    </div>
  );
}
