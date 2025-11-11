import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { KeepAliveProvider } from "@/providers/keep-alive-provider";
import { ReminderCheckerProvider } from "@/providers/reminder-checker-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthCare Assistant",
  description:
    "Your AI-powered health companion for medication reminders and health management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <KeepAliveProvider>
            <ReminderCheckerProvider>
              {children}
              <Toaster richColors position="top-right" />
            </ReminderCheckerProvider>
          </KeepAliveProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
