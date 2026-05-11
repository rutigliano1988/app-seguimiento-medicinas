"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { inviteSchema, type InviteValues } from "@/lib/validations/family";
import { Loader2 } from "lucide-react";

export function FamilyInviteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
  });

  async function onSubmit(data: InviteValues) {
    setLoading(true);
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

    toast.success(`Invitación enviada a ${data.email}`);
    reset();
    router.push("/family");
  }

  return (
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
  );
}
