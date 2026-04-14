import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthGuard from "@/components/providers/AuthGuard";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Weekedule | 주간 일정과 공유 캘린더를 더 명확하게",
    template: "%s | Weekedule",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Weekedule | 주간 일정과 공유 캘린더를 더 명확하게",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekedule | 주간 일정과 공유 캘린더를 더 명확하게",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClient =
    process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true"
      ? process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-9920827976663604"
      : null;

  return (
    <html lang="ko">
      <body className="min-h-screen bg-surface text-on-surface font-sans antialiased">
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
        {adsenseClient ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
