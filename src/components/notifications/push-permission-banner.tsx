"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushPermissionBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "default") setShow(true);
  }, []);

  if (!show) return null;

  async function enableNotifications() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notificaciones denegadas. Puedes habilitarlas desde la configuración del navegador.");
        setShow(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      const sub = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.keys,
          userAgent: navigator.userAgent,
        }),
      });

      toast.success("Notificaciones activadas");
      setShow(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al activar notificaciones");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-slate-900 text-white rounded-lg px-4 py-3 text-sm">
      <Bell size={16} className="shrink-0 text-emerald-400" />
      <p className="flex-1">Activa las notificaciones para recibir recordatorios de tus medicamentos.</p>
      <Button
        size="sm"
        onClick={enableNotifications}
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
      >
        Activar
      </Button>
      <button onClick={() => setShow(false)} className="text-slate-400 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
