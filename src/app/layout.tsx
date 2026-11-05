import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeShift — AI Code Integrity Gate",
  description:
    "Stop AI-induced architectural drift. VibeShift validates AI-generated Pull Requests before they corrupt your codebase. 4 parallel AI agents — Pattern Drift, Security Sentinel, Dependency Guardian, Test Gap Finder.",
  keywords: [
    "AI code review",
    "pull request analysis",
    "AI code integrity",
    "GitHub PR checker",
    "prevent AI code drift",
    "AI generated code review",
    "automated code review",
    "architectural drift detection",
    "OWASP security scan",
    "hallucination detection npm",
    "Cursor AI code review",
    "Copilot PR validation",
    "code integrity gate",
    "AI pull request validator",
    "vibeshift",
  ],
  authors: [{ name: "VibeShift" }],
  creator: "VibeShift",
  metadataBase: new URL("https://vibeshift-red.vercel.app"),
  openGraph: {
    title: "VibeShift — AI Code Integrity Gate",
    description:
      "Stop AI-induced architectural drift before it merges. 4 parallel AI agents validate every AI-generated PR in under 4 seconds.",
    type: "website",
    url: "https://vibeshift-red.vercel.app",
    siteName: "VibeShift",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeShift — AI Code Integrity Gate",
    description:
      "Stop AI-induced architectural drift before it merges. 4 parallel AI agents validate every AI-generated PR in under 4 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3545875522161538"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-slate-100 min-h-screen`}
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}

