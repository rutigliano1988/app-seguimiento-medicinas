import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { z } from "zod";

const doseLogSchema = z.object({
  medicineId: z.string(),
  scheduleId: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(["TAKEN", "SKIPPED", "LATE"]),
  notes: z.string().optional(),
  dosesTaken: z.number().min(0).default(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = doseLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { medicineId, scheduleId, scheduledAt, status, notes, dosesTaken } = parsed.data;

  const medicine = await prisma.medicine.findFirst({
    where: { id: medicineId, userId: session.user.id },
    include: { inventory: true },
  });
  if (!medicine) return NextResponse.json({ error: "Medicina no encontrada" }, { status: 404 });

  const log = await prisma.doseLog.create({
    data: {
      userId: session.user!.id as string,
      medicineId,
      scheduleId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status,
      notes,
      dosesTaken,
    },
  });

  if (status === "TAKEN" && medicine.inventory) {
    const newStock = Math.max(0, medicine.inventory.currentStock - dosesTaken);
    await prisma.inventory.update({
      where: { medicineId },
      data: { currentStock: newStock },
    });

    if (
      medicine.inventory.currentStock > medicine.inventory.lowStockThreshold &&
      newStock <= medicine.inventory.lowStockThreshold
    ) {
      const uid = session.user!.id as string;
      setImmediate(() =>
        sendPushToUser(uid, {
          title: "Stock bajo",
          body: `Quedan ${newStock} ${medicine.inventory!.unit} de ${medicine.name}`,
          url: "/inventory",
          medicineId,
        }).catch(console.error)
      );
    }
  }

  return NextResponse.json(log, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const medicineId = searchParams.get("medicineId");
  const status = searchParams.get("status") as "TAKEN" | "SKIPPED" | "LATE" | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const logs = await prisma.doseLog.findMany({
    where: {
      userId: session.user.id,
      ...(medicineId && { medicineId }),
      ...(status && { status }),
      ...(from || to
        ? {
            takenAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    },
    include: { medicine: { select: { name: true, color: true } } },
    orderBy: { takenAt: "desc" },
    take: 100,
  });

  return NextResponse.json(logs);
}
