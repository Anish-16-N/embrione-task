import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import InteractiveBackground from "@/components/InteractiveBackground"
import SmoothScroll from "@/components/SmoothScroll"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Embrione - Meet The Team",
  description: "Web Development Domain Recruitment Challenge",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <InteractiveBackground />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10">
            <div className="mx-auto max-w-6xl overflow-hidden px-6 pt-16">
              <p aria-hidden className="select-none text-[clamp(3rem,15vw,14rem)] font-semibold leading-[0.85] tracking-tighter text-foreground/[0.06]">
                Embrione
              </p>
            </div>
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:justify-between">
              <span>© 2026 The Embrione</span>
              <span>Department of Computer Science &amp; Engineering, PES University</span>
            </div>
          </footer>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}