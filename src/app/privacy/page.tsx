"use client";

import Link from "next/link";
import { useSettingsStore } from "@/lib/settingsStore";

const T = {
  ko: {
    back: "← 돌아가기",
    title: "개인정보 처리방침",
    updated: "최종 수정일: 2026년 4월 13일",
    sections: [
      {
        heading: "1. 수집하는 개인정보",
        body: "Weekedule은 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.\n\n• 이름, 이메일 주소, 비밀번호(암호화 저장)\n• 사용자가 직접 입력한 시간표 데이터(일정 제목, 요일, 시간, 위치 등)\n• 서비스 이용 과정에서 자동으로 생성되는 정보(접속 로그, IP 주소 등)",
      },
      {
        heading: "2. 개인정보의 수집 및 이용 목적",
        body: "• 회원 식별 및 인증\n• 시간표·일정 데이터의 저장 및 동기화\n• 친구 초대, 룸 일정 공유 등 협업 기능 제공\n• 서비스 개선 및 오류 분석",
      },
      {
        heading: "3. 개인정보의 보유 및 이용 기간",
        body: "회원 탈퇴 시 또는 이용 목적 달성 후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우에는 해당 기간 동안 보관합니다.",
      },
      {
        heading: "4. 개인정보의 제3자 제공",
        body: "Weekedule은 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 따른 요청이 있는 경우는 예외로 합니다.",
      },
      {
        heading: "5. 개인정보 보호를 위한 기술적·관리적 조치",
        body: "• 비밀번호 bcrypt 단방향 암호화 저장\n• HTTPS를 통한 전송 구간 암호화\n• 최소 권한 원칙에 따른 내부 접근 통제",
      },
      {
        heading: "6. 쿠키 및 세션",
        body: "Weekedule은 로그인 상태 유지를 위해 HttpOnly 세션 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 비활성화할 경우 일부 기능이 제한될 수 있습니다.",
      },
      {
        heading: "7. 이용자의 권리",
        body: "이용자는 언제든지 자신의 개인정보를 조회·수정하거나 삭제(회원 탈퇴)를 요청할 수 있습니다. 설정 메뉴를 통해 직접 처리하거나 문의를 통해 요청하실 수 있습니다.",
      },
      {
        heading: "8. 문의",
        body: "개인정보 처리와 관련한 문의는 피드백 탭을 통해 제출해 주세요.",
      },
    ],
  },
  en: {
    back: "← Back",
    title: "Privacy Policy",
    updated: "Last updated: April 13, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "Weekedule collects the following information to provide its services.\n\n• Name, email address, password (stored encrypted)\n• Schedule data entered by users (event title, day, time, location, etc.)\n• Automatically generated data during service use (access logs, IP address, etc.)",
      },
      {
        heading: "2. How We Use Your Information",
        body: "• User identification and authentication\n• Storing and syncing timetable and schedule data\n• Providing collaboration features such as friend invites and room schedule sharing\n• Service improvement and error analysis",
      },
      {
        heading: "3. Data Retention",
        body: "Your data is deleted upon account deletion or when the purpose of collection is fulfilled. Data may be retained longer if required by applicable law.",
      },
      {
        heading: "4. Third-Party Sharing",
        body: "Weekedule does not share your personal information with third parties without your consent, except as required by law.",
      },
      {
        heading: "5. Security Measures",
        body: "• Passwords are stored using bcrypt one-way hashing\n• All data is transmitted over HTTPS\n• Internal access is controlled based on the principle of least privilege",
      },
      {
        heading: "6. Cookies & Sessions",
        body: "Weekedule uses HttpOnly session cookies to maintain login state. Disabling cookies in your browser may limit certain features.",
      },
      {
        heading: "7. Your Rights",
        body: "You may view, modify, or delete (via account deletion) your personal information at any time through the Settings menu.",
      },
      {
        heading: "8. Contact",
        body: "For privacy-related inquiries, please use the Feedback tab.",
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { language } = useSettingsStore();
  const t = T[language];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        <Link href="/settings?section=about" className="text-sm text-primary font-semibold hover:underline mb-6 inline-block">
          {t.back}
        </Link>
        <h1 className="text-2xl font-extrabold text-on-surface mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h1>
        <p className="text-xs text-on-surface-variant mb-8">{t.updated}</p>

        <div className="flex flex-col gap-6">
          {t.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-sm font-bold text-on-surface mb-2">{s.heading}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
