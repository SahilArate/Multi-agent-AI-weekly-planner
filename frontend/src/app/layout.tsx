import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeeklyAI — Plan your week with AI",
  description: "5 AI agents build your perfect weekly schedule",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}