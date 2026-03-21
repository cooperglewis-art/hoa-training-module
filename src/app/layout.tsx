import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { CustomSessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CCR Enforcement Training",
  description:
    "Interactive training program for HOA/POA/COA employees on CCR enforcement in Texas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${garamond.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          <CustomSessionProvider>
            {children}
            <Toaster />
          </CustomSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
