import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Engineer's Educations — Engineering Learning Platform",
  description:
    "A comprehensive engineering education platform: 23 disciplines, rich lessons, a question bank driven by a Generation Matrix, in-browser admin, and progress tracking.",
  keywords: [
    "engineering education",
    "engineering courses",
    "quiz",
    "question bank",
    "Generation Matrix",
    "learning platform",
    "mechanical",
    "civil",
    "electrical",
  ],
  authors: [{ name: "Engineer's Educations" }],
  openGraph: {
    title: "Engineer's Educations",
    description:
      "23 engineering disciplines, rich lessons, a 5,000-question Generation Matrix, in-browser admin.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineer's Educations",
    description:
      "Engineering learning platform with curriculum, quizzes, and admin tools.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
