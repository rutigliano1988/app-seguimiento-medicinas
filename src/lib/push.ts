import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  scheduleId?: string;
  medicineId?: string;
}

function initVapid() {
  if (
    process.env.VAPID_MAILTO &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_MAILTO,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  initVapid();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  const expiredIds: string[] = [];
  results.forEach((result, i) => {
    if (
      result.status === "rejected" &&
      (result.reason as { statusCode?: number })?.statusCode === 410
    ) {
      expiredIds.push(subscriptions[i].id);
    }
  });

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expiredIds } },
    });
  }
}
