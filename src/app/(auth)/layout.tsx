import { APP_NAME, LAW_FIRM_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-2xl font-bold">
                CCR
              </span>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-secondary-foreground mb-4">
            {APP_NAME}
          </h1>
          <p className="text-secondary-foreground/80 text-lg font-sans">
            {LAW_FIRM_NAME}
          </p>
          <div className="mt-12 border-t border-secondary-foreground/20 pt-8">
            <p className="text-secondary-foreground/60 text-sm font-sans leading-relaxed">
              Interactive training program for HOA, POA, and COA board members
              and managers on CCR enforcement procedures in Texas.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        {/* Mobile branding header */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-primary-foreground font-serif text-lg font-bold">
              CCR
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-secondary mb-2">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground text-sm font-sans">
            {LAW_FIRM_NAME}
          </p>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
