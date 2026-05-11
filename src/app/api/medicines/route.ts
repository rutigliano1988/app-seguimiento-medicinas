import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { medicineFormSchema } from "@/lib/validations/medicine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const userId = session.user.id;
  const user = session.user as { id: string; familyGroupId?: string | null; adminOfGroupId?: string | null };
  const isAdmin = !!user.adminOfGroupId;

  const where =
    isAdmin && user.familyGroupId
      ? { user: { familyGroupId: user.familyGroupId }, isActive: true }
      : { userId, isActive: true };

  const medicines = await prisma.medicine.findMany({
    where,
    include: {
      schedules: { where: { isActive: true } },
      inventory: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(medicines);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = medicineFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, genericName, dosage, form, instructions, color, schedule, inventory } = parsed.data;

  const med = await prisma.medicine.create({
    data: {
      userId: session.user!.id as string,
      name,
      genericName,
      dosage,
      form,
      instructions,
      color,
    },
  });

  if (schedule) {
    await prisma.schedule.create({
      data: {
        medicineId: med.id,
        frequency: schedule.frequency,
        times: schedule.times,
        daysOfWeek: schedule.daysOfWeek,
        startDate: new Date(schedule.startDate),
        endDate: schedule.endDate ? new Date(schedule.endDate) : null,
      },
    });
  }

  if (inventory) {
    await prisma.inventory.create({
      data: {
        medicineId: med.id,
        currentStock: inventory.currentStock,
        unit: inventory.unit,
        lowStockThreshold: inventory.lowStockThreshold,
        expiryDate: inventory.expiryDate ? new Date(inventory.expiryDate) : null,
      },
    });
  }

  const medicine = med;

  return NextResponse.json(medicine, { status: 201 });
}
