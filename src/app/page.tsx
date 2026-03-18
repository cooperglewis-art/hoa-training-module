import Link from "next/link";
import { APP_NAME, LAW_FIRM_NAME } from "@/lib/constants";
import { BookOpen, Shield, Award, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-secondary text-white font-serif font-bold text-xl px-3 py-1.5 rounded">
              CCR
            </div>
            <span className="font-serif text-lg text-foreground">
              Enforcement Training
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted to-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-4">
            Presented by {LAW_FIRM_NAME}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-secondary font-bold leading-tight mb-6">
            {APP_NAME}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            An interactive training program for HOA, POA, and COA employees to
            master CC&amp;R enforcement procedures under Texas law.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start Training
            </Link>
            <Link
              href="/login"
              className="border border-border text-foreground px-8 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
            >
              Log In to Continue
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-secondary font-bold text-center mb-12">
            What You&apos;ll Learn
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-primary" />}
              title="Governing Documents"
              description="Understand the hierarchy of CC&Rs, bylaws, and rules — and how they interact with Texas Property Code."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Enforcement Process"
              description="Learn the step-by-step enforcement process from violation notice through hearing and resolution."
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-primary" />}
              title="Pre-Lawsuit & Alternatives"
              description="Explore evidence collection, escalation decisions, and alternative dispute resolution before litigation."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl text-secondary font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enroll", desc: "Register through your organization's enrollment link" },
              { step: "2", title: "Learn", desc: "Complete 3 interactive modules at your own pace" },
              { step: "3", title: "Assess", desc: "Pass the case study assessment (3/4 required)" },
              { step: "4", title: "Certify", desc: "Receive your certificate of completion" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-serif text-lg font-semibold text-secondary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-tenant */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-3xl text-secondary font-bold mb-4">
            For Organizations
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Enroll your team, track their progress, and ensure compliance. Our
            platform supports HOAs, POAs, and COAs with content tailored to your
            association type.
          </p>
          <Link
            href="/register"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
          >
            Contact Us to Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {LAW_FIRM_NAME}. All rights
            reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            This training is for educational purposes only and does not
            constitute legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border p-6 bg-white hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-semibold text-secondary mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
