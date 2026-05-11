import { Resend } from "resend";

export async function sendFamilyInviteEmail({
  to,
  inviterName,
  groupName,
  token,
}: {
  to: string;
  inviterName: string;
  groupName: string;
  token: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const url = `${process.env.NEXTAUTH_URL}/family/accept?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `${inviterName} te invitó a unirse a "${groupName}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Invitación a grupo familiar</h2>
        <p><strong>${inviterName}</strong> te invitó a unirse al grupo familiar <strong>"${groupName}"</strong> en Seguimiento de Medicinas.</p>
        <p>
          <a href="${url}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
            Aceptar invitación
          </a>
        </p>
        <p style="color:#6b7280;font-size:14px;">Este enlace expira en 7 días. Si no esperabas esta invitación, puedes ignorar este email.</p>
      </div>
    `,
  });
}
