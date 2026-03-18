import { db } from "@/lib/db";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Enroll | CCR Enforcement Training",
};

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await db.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!org) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-secondary mb-4">
          Organization Not Found
        </h2>
        <p className="text-muted-foreground">
          The organization you are looking for does not exist. Please check the
          link and try again.
        </p>
      </div>
    );
  }

  if (!org.active) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold text-secondary mb-4">
          Organization Inactive
        </h2>
        <p className="text-muted-foreground">
          This organization is not currently accepting new enrollments. Please
          contact your organization administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">
          Register to enroll with
        </p>
        <p className="font-serif text-lg font-semibold text-secondary">
          {org.name}
        </p>
      </div>
      <RegisterForm orgSlug={orgSlug} orgName={org.name} />
    </div>
  );
}
