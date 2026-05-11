import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateInventorySchema = z.object({
  medicineId: z.string(),
  currentStock: z.number().min(0),
  unit: z.string().min(1),
  lowStockThreshold: z.number().min(0),
  expiryDate: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const inventory = await prisma.inventory.findMany({
    where: { medicine: { userId: session.user.id, isActive: true } },
    include: { medicine: { select: { name: true, color: true, form: true } } },
    orderBy: { medicine: { name: "asc" } },
  });

  return NextResponse.json(inventory);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = updateInventorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { medicineId, currentStock, unit, lowStockThreshold, expiryDate } = parsed.data;

  const medicine = await prisma.medicine.findFirst({
    where: { id: medicineId, userId: session.user.id },
  });
  if (!medicine) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.inventory.upsert({
    where: { medicineId },
    create: { medicineId, currentStock, unit, lowStockThreshold, expiryDate: expiryDate ? new Date(expiryDate) : null },
    update: { currentStock, unit, lowStockThreshold, expiryDate: expiryDate ? new Date(expiryDate) : null },
  });

  return NextResponse.json(updated);
}
