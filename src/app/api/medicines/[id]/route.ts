import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getMedicineForUser(id: string, userId: string) {
  return prisma.medicine.findFirst({
    where: { id, userId },
    include: { schedules: true, inventory: true, doseLogs: { orderBy: { takenAt: "desc" }, take: 50 } },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const medicine = await getMedicineForUser(id, session.user.id);
  if (!medicine) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(medicine);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const existing = await getMedicineForUser(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const { name, genericName, dosage, form, instructions, color, isActive } = body;

  const updated = await prisma.medicine.update({
    where: { id },
    data: { name, genericName, dosage, form, instructions, color, isActive },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const existing = await getMedicineForUser(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.medicine.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
