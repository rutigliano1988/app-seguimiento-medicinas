"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InviteInfo {
  email: string;
  groupName: string;
  inviterName: string;
  token: string;
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) { setInviteError("Token inválido"); return; }
    fetch(`/api/family/invite?token=${token}`)
      .then((r) => r.json())
      .then((data: { error?: string } & InviteInfo) => {
        if (data.error) setInviteError(data.error);
        else setInvite(data);
      });
  }, [token]);

  async function acceptInvite() {
    if (!token) return;
    setAccepting(true);
    const res = await fetch("/api/family/invite", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      setAccepted(true);
      setTimeout(() => router.push("/family"), 2000);
    } else {
      const json = await res.json() as { error?: string };
      setInviteError(json.error ?? "Error al aceptar la invitación");
    }
    setAccepting(false);
  }

  if (!token || inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <p className="text-rose-500 mb-4">{inviteError ?? "Token inválido"}</p>
            <Link href="/dashboard" className={buttonVariants()}>Ir al inicio</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <p className="font-semibold text-slate-900">¡Te uniste al grupo <strong>{invite.groupName}</strong>!</p>
            <p className="text-sm text-slate-400">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Users className="mx-auto text-slate-400 mb-2" size={40} />
          <CardTitle className="text-base">Invitación familiar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            <strong>{invite.inviterName}</strong> te invitó a unirte al grupo{" "}
            <strong>"{invite.groupName}"</strong> en Seguimiento de Medicinas.
          </p>

          {status === "unauthenticated" ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Necesitas iniciar sesión para aceptar la invitación.</p>
              <Link
                href={`/login?callbackUrl=/family/accept?token=${token}`}
                className={cn(buttonVariants(), "w-full bg-slate-900 hover:bg-slate-700 flex justify-center")}
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/register?callbackUrl=/family/accept?token=${token}`}
                className={cn(buttonVariants({ variant: "outline" }), "w-full flex justify-center")}
              >
                Crear cuenta
              </Link>
            </div>
          ) : status === "authenticated" ? (
            <Button
              onClick={acceptInvite}
              disabled={accepting}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {accepting && <Loader2 size={16} className="mr-2 animate-spin" />}
              Aceptar invitación
            </Button>
          ) : (
            <Loader2 className="animate-spin mx-auto text-slate-400" size={24} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
