import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { email: ["Este email ya está registrado"] } }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
