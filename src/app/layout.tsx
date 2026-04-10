import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
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
      <body className="bg-surface text-on-surface font-sans antialiased flex h-full overflow-hidden">
        <ThemeProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
