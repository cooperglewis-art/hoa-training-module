import { db } from "@/lib/db";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Accept Invitation | CCR Enforcement Training",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.inviteToken.findUnique({
    where: { token },
    include: { org: true },
  });

  if (!invite) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-secondary mb-4">
          Invalid Invitation
        </h2>
        <p className="text-muted-foreground">
          This invitation link is not valid. Please contact your organization
          administrator for a new invitation.
        </p>
      </div>
    );
  }

  if (invite.usedAt) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-secondary mb-4">
          Invitation Already Used
        </h2>
        <p className="text-muted-foreground">
          This invitation has already been used. If you already have an account,
          please{" "}
          <a href="/login" className="text-primary hover:underline">
            sign in
          </a>
          .
        </p>
      </div>
    );
  }

  if (new Date() > invite.expiresAt) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-secondary mb-4">
          Invitation Expired
        </h2>
        <p className="text-muted-foreground">
          This invitation has expired. Please contact your organization
          administrator for a new invitation.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">
          You have been invited to join
        </p>
        <p className="font-serif text-lg font-semibold text-secondary">
          {invite.org.name}
        </p>
      </div>
      <RegisterForm inviteToken={token} orgName={invite.org.name} />
    </div>
  );
}
