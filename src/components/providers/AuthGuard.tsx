"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/authStore";
import DataProvider from "./DataProvider";

const AUTH_ONLY_PUBLIC = ["/login", "/signup"];
const ALWAYS_PUBLIC = [
  "/",
  "/about",
  "/contact",
  "/editorial-policy",
  "/friends/invite",
  "/guides",
  "/privacy",
  "/terms",
];
const ALWAYS_PUBLIC_PREFIXES = ["/invite/", "/guides/"];

function isAlwaysPublic(pathname: string) {
  return (
    ALWAYS_PUBLIC.includes(pathname) ||
    ALWAYS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isAuthOnlyPublic(pathname: string) {
  return AUTH_ONLY_PUBLIC.includes(pathname);
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest, _hydrated, fetchMe } = useAuthStore();

  const isLoggedIn = !!user || isGuest;
  const isRealUser = !!user && !isGuest;

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!_hydrated) return;

    if (isRealUser && pathname === "/") {
      router.replace("/home");
      return;
    }

    if (isRealUser && isAuthOnlyPublic(pathname)) {
      router.replace("/home");
      return;
    }

    if (!isLoggedIn && !isAlwaysPublic(pathname) && !isAuthOnlyPublic(pathname)) {
      router.replace("/");
    }
  }, [isLoggedIn, isRealUser, pathname, _hydrated, router]);

  if (!_hydrated) return null;

  if (isRealUser && pathname === "/") return null;
  if (isRealUser && isAuthOnlyPublic(pathname)) return null;
  if (!isLoggedIn && !isAlwaysPublic(pathname) && !isAuthOnlyPublic(pathname)) {
    return null;
  }

  if (isAuthOnlyPublic(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isAlwaysPublic(pathname)) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <DataProvider>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 md:pb-0">
          {children}
        </div>
      </DataProvider>
    </div>
  );
}
