import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const schedule = await prisma.schedule.findFirst({
    where: { id, medicine: { userId: session.user.id } },
  });
  if (!schedule) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const { isActive, times, frequency, daysOfWeek, startDate, endDate } = body;

  const updated = await prisma.schedule.update({
    where: { id },
    data: { isActive, times, frequency, daysOfWeek, startDate, endDate },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const schedule = await prisma.schedule.findFirst({
    where: { id, medicine: { userId: session.user.id } },
  });
  if (!schedule) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
