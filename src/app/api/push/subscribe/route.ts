import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { endpoint, keys, userAgent } = await req.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Datos de suscripción inválidos" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
