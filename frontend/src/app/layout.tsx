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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { document.documentElement.dataset.theme = localStorage.getItem('weeklyai-theme') === 'light' ? 'light' : 'dark' } catch { document.documentElement.dataset.theme = 'dark' }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}