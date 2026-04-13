"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Sidebar from "@/components/layout/Sidebar";
import DataProvider from "./DataProvider";

// 로그인 없이만 접근 (로그인 상태면 /home으로)
const AUTH_ONLY_PUBLIC = ["/login", "/signup"];
// 로그인 여부 관계없이 항상 접근 가능
const ALWAYS_PUBLIC = ["/", "/privacy", "/terms"];

function isAlwaysPublic(pathname: string) {
  return ALWAYS_PUBLIC.includes(pathname) || pathname.startsWith("/invite/");
}
function isAuthOnlyPublic(pathname: string) {
  return AUTH_ONLY_PUBLIC.includes(pathname);
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { user, isGuest, _hydrated, fetchMe } = useAuthStore();

  const isLoggedIn = !!user || isGuest;

  // 앱 시작 시 서버 세션 확인
  useEffect(() => {
    fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!_hydrated) return;
    // 랜딩(/)에서 로그인 상태면 /home으로
    if (isLoggedIn && pathname === "/") { router.replace("/home"); return; }
    // 로그인 전용 공개 페이지(login/signup)에서 로그인 상태면 /home으로
    if (isLoggedIn && isAuthOnlyPublic(pathname)) { router.replace("/home"); return; }
    // 인증 필요 페이지에서 비로그인이면 /로
    if (!isLoggedIn && !isAlwaysPublic(pathname) && !isAuthOnlyPublic(pathname)) router.replace("/");
  }, [isLoggedIn, pathname, _hydrated, router]);

  if (!_hydrated) return null;

  // 리디렉트 대기 중
  if (isLoggedIn && pathname === "/") return null;
  if (isLoggedIn && isAuthOnlyPublic(pathname)) return null;
  if (!isLoggedIn && !isAlwaysPublic(pathname) && !isAuthOnlyPublic(pathname)) return null;

  // 로그인 전용 공개 페이지 (login/signup): 사이드바 없음
  if (isAuthOnlyPublic(pathname)) {
    return <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>;
  }

  // 항상 접근 가능 (랜딩/invite/privacy/terms): 로그인 상태면 사이드바 포함
  if (isAlwaysPublic(pathname)) {
    if (isLoggedIn && pathname !== "/") {
      return (
        <>
          <Sidebar />
          <DataProvider>
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 md:pb-0">{children}</div>
          </DataProvider>
        </>
      );
    }
    return <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>;
  }

  // 인증된 페이지: 사이드바 + 데이터 로딩
  return (
    <>
      <Sidebar />
      <DataProvider>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 md:pb-0">{children}</div>
      </DataProvider>
    </>
  );
}
