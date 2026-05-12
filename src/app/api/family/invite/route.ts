import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteSchema } from "@/lib/validations/family";
import { sendFamilyInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const adminGroup = await prisma.familyGroup.findUnique({
    where: { adminId: session.user.id },
  });
  if (!adminGroup) {
    return NextResponse.json({ error: "Debes crear un grupo familiar primero" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email } = parsed.data;

  const alreadyMember = await prisma.user.findFirst({
    where: { email, familyGroupId: adminGroup.id },
  });
  if (alreadyMember) {
    return NextResponse.json({ error: "Este usuario ya es miembro del grupo" }, { status: 409 });
  }

  const existingInvite = await prisma.familyInvite.findFirst({
    where: { email, familyGroupId: adminGroup.id, status: "PENDING" },
  });
  if (existingInvite) {
    return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 409 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.familyInvite.create({
    data: {
      email,
      familyGroupId: adminGroup.id,
      senderId: session.user.id,
      expiresAt,
    },
    include: { sender: { select: { name: true } } },
  });

  let emailSent = false;
  try {
    await sendFamilyInviteEmail({
      to: email,
      inviterName: invite.sender.name ?? "Un miembro",
      groupName: adminGroup.name,
      token: invite.token,
    });
    emailSent = true;
  } catch (err) {
    console.error("Error sending invite email:", err);
  }

  return NextResponse.json({ success: true, emailSent, token: invite.token }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const invite = await prisma.familyInvite.findUnique({
    where: { token },
    include: { familyGroup: { select: { name: true } }, sender: { select: { name: true } } },
  });

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 404 });
  }

  return NextResponse.json({
    email: invite.email,
    groupName: invite.familyGroup.name,
    inviterName: invite.sender.name,
    token: invite.token,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { token } = body;
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const invite = await prisma.familyInvite.findUnique({ where: { token } });
  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 404 });
  }

  const sessionEmail = session.user.email ?? "";
  if (invite.email.toLowerCase() !== sessionEmail.toLowerCase()) {
    return NextResponse.json({ error: "Esta invitación no es para tu cuenta" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { familyGroupId: invite.familyGroupId },
  });
  await prisma.familyInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json({ success: true });
}
