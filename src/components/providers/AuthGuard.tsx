"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Sidebar from "@/components/layout/Sidebar";
import DataProvider from "./DataProvider";

const PUBLIC_PATHS = ["/", "/login", "/signup"];
function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/invite/");
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { user, isGuest, _hydrated, fetchMe } = useAuthStore();

  const isPublic   = isPublicPath(pathname);
  const isLoggedIn = !!user || isGuest;

  // 앱 시작 시 서버 세션 확인
  useEffect(() => {
    fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!_hydrated) return;
    // 랜딩 페이지(/)에서 로그인 상태면 /home으로
    if (isLoggedIn && pathname === "/") { router.replace("/home"); return; }
    if (!isLoggedIn && !isPublic) router.replace("/");
    // invite 페이지는 로그인 상태여도 리다이렉트 안 함
    if (isLoggedIn && isPublic && pathname !== "/" && !pathname.startsWith("/invite/")) router.replace("/home");
  }, [isLoggedIn, isPublic, pathname, _hydrated, router]);

  // 세션 확인 전 (hydration 대기)
  if (!_hydrated) return null;

  // 리디렉트 중에는 렌더링 안 함
  if (isLoggedIn && pathname === "/") return null;
  if (!isLoggedIn && !isPublic) return null;
  if (isLoggedIn && isPublic && pathname !== "/" && !pathname.startsWith("/invite/")) return null;

  // 공개 페이지 (랜딩/로그인/회원가입/초대): 사이드바 없이 전체 화면
  if (isPublic) {
    return <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>;
  }

  // 인증된 페이지 (일반 로그인 or 게스트): 사이드바 + 데이터 로딩
  return (
    <>
      <Sidebar />
      <DataProvider>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 md:pb-0">{children}</div>
      </DataProvider>
    </>
  );
}
