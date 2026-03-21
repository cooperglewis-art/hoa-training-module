import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Register | CCR Enforcement Training",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl text-secondary">
          Registration Requires an Invitation
        </CardTitle>
        <CardDescription>
          To register for CCR Enforcement Training, you need an invite link or
          enrollment link from your organization. Please contact your HOA, POA,
          or COA administrator for access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
