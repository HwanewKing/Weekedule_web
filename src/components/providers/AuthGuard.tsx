"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Sidebar from "@/components/layout/Sidebar";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!user && !isPublic) {
      router.replace("/login");
    }
    if (user && isPublic) {
      router.replace("/");
    }
  }, [user, isPublic, router]);

  // 리디렉트 중에는 아무것도 렌더링하지 않음
  if (!user && !isPublic) return null;
  if (user && isPublic) return null;

  // 로그인/회원가입 페이지: 사이드바 없이 전체 화면
  if (isPublic) {
    return <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>;
  }

  // 인증된 페이지: 사이드바 포함
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
    </>
  );
}
