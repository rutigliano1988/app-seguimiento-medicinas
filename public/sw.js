self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: data.url ?? "/dashboard", scheduleId: data.scheduleId, medicineId: data.medicineId },
      actions: [
        { action: "taken", title: "Marcar como tomada" },
        { action: "snooze", title: "Posponer 10 min" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "taken" && event.notification.data?.scheduleId) {
    event.waitUntil(
      fetch("/api/dose-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: event.notification.data.medicineId,
          scheduleId: event.notification.data.scheduleId,
          status: "TAKEN",
        }),
      })
    );
  } else {
    const url = event.notification.data?.url ?? "/dashboard";
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    );
  }
});
