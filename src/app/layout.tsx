import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import type { ComponentProps } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evently — Plan events & track RSVPs",
  description:
    "Create events, share unique invite links, and track Going / Maybe / Not Going responses in real-time.",
};

type NeonAuthClient = ComponentProps<typeof NeonAuthUIProvider>["authClient"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <NeonAuthUIProvider
          authClient={authClient as NeonAuthClient}
          defaultTheme="dark"
        >
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
