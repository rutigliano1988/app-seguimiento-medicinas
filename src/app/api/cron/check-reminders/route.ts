import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const currentTime = `${hh}:${mm}`;

  // Find active schedules that have this time in their times array
  const schedules = await prisma.schedule.findMany({
    where: {
      isActive: true,
      times: { has: currentTime },
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: {
      medicine: { select: { id: true, name: true, userId: true } },
    },
  });

  const dayOfWeek = now.getUTCDay();
  const results: string[] = [];

  for (const schedule of schedules) {
    // Check day-of-week constraint for SPECIFIC_DAYS frequency
    if (
      schedule.frequency === "SPECIFIC_DAYS" &&
      schedule.daysOfWeek.length > 0 &&
      !schedule.daysOfWeek.includes(dayOfWeek)
    ) {
      continue;
    }

    // Build the scheduledAt for this dose (today at this UTC time)
    const scheduledAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), 0)
    );

    // Avoid duplicate notifications: check if a log already exists for this slot (within 2-minute window)
    const windowStart = new Date(scheduledAt.getTime() - 60_000);
    const windowEnd = new Date(scheduledAt.getTime() + 60_000);

    const existingLog = await prisma.doseLog.findFirst({
      where: {
        scheduleId: schedule.id,
        scheduledAt: { gte: windowStart, lte: windowEnd },
      },
    });

    if (existingLog) continue;

    await sendPushToUser(schedule.medicine.userId, {
      title: `💊 Hora de tomar ${schedule.medicine.name}`,
      body: "Toca para registrar la toma",
      url: "/dashboard",
      scheduleId: schedule.id,
      medicineId: schedule.medicine.id,
    });

    results.push(schedule.medicine.name);
  }

  return NextResponse.json({ notified: results, time: currentTime });
}
