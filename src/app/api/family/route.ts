import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGroupSchema } from "@/lib/validations/family";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      familyGroup: {
        include: {
          members: { select: { id: true, name: true, email: true, image: true } },
          invites: { where: { status: "PENDING" } },
        },
      },
    },
  });

  return NextResponse.json(user?.familyGroup ?? null);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingAdmin = await prisma.familyGroup.findUnique({
    where: { adminId: session.user.id },
  });
  if (existingAdmin) {
    return NextResponse.json({ error: "Ya tienes un grupo familiar" }, { status: 409 });
  }

  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.familyGroup.create({
      data: { name: parsed.data.name, adminId: session.user!.id as string },
    });
    await tx.user.update({
      where: { id: session.user!.id as string },
      data: { familyGroupId: g.id },
    });
    return g;
  });

  return NextResponse.json(group, { status: 201 });
}
