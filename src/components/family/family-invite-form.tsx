"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { inviteSchema, type InviteValues } from "@/lib/validations/family";
import { Loader2, Copy, CheckCheck } from "lucide-react";

export function FamilyInviteForm() {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
  });

  async function onSubmit(data: InviteValues) {
    setLoading(true);
    setInviteLink(null);
    const res = await fetch("/api/family/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Error al enviar la invitación");
      setLoading(false);
      return;
    }

    const link = `${window.location.origin}/family/accept?token=${json.token}`;
    setInviteLink(link);

    if (json.emailSent) {
      toast.success(`Invitación enviada a ${data.email}`);
    } else {
      toast.warning("Invitación creada, pero el email no pudo enviarse. Comparte el enlace manualmente.");
    }

    reset();
    setLoading(false);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email del familiar</Label>
              <Input type="email" placeholder="familiar@email.com" {...register("email")} />
              {errors.email && <p className="text-sm text-rose-500">{errors.email.message}</p>}
            </div>
            <p className="text-xs text-slate-400">
              Se enviará un email con un enlace de invitación. El enlace expira en 7 días.
            </p>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-700">
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Enviar invitación
            </Button>
          </form>
        </CardContent>
      </Card>

      {inviteLink && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 space-y-2">
            <p className="text-sm font-medium text-amber-800">Enlace de invitación</p>
            <p className="text-xs text-amber-700">Comparte este enlace con tu familiar directamente:</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="text-xs bg-white border-amber-200"
              />
              <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0 border-amber-200">
                {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
