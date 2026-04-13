import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/providers/AuthGuard";
import ThemeProvider from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Weekedule — Orchestrated Flow",
  description: "프리미엄 주간 스케줄 협업 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${manrope.variable} h-full`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9920827976663604"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased flex h-full overflow-hidden">
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
