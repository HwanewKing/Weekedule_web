"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

interface GuestStartButtonProps {
  label?: string;
  className?: string;
}

export default function GuestStartButton({
  label = "게스트로 사용해보기",
  className,
}: GuestStartButtonProps) {
  const router = useRouter();
  const { loginAsGuest } = useAuthStore();

  const handleClick = () => {
    loginAsGuest();
    router.replace("/home");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
