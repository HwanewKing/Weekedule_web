"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import type { NotificationType } from "@/lib/notificationTypes";
import { useSettingsStore } from "@/lib/settingsStore";

type Section = "profile" | "timetable" | "display" | "notifications" | "about";
type SettingsNotificationType = Exclude<NotificationType, "friend_accepted">;

const NOTIF_TYPES: SettingsNotificationType[] = [
  "room_invite",
  "friend_request",
  "meeting_confirmed",
  "member_joined",
  "schedule_conflict",
];

function Card({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {title}
        </h2>
        {desc ? <p className="mt-0.5 text-xs text-on-surface-variant">{desc}</p> : null}
      </div>
      <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
        {children}
      </div>
    </section>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 border-t border-outline-variant/10 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {desc ? <p className="mt-0.5 text-xs text-on-surface-variant">{desc}</p> : null}
      </div>
      {children ? <div className="w-full shrink-0 sm:w-auto">{children}</div> : null}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-surface-container-high"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const {
    startOfWeek,
    setStartOfWeek,
    showWeekends,
    setShowWeekends,
    gridStart,
    setGridStart,
    gridEnd,
    setGridEnd,
    theme,
    setTheme,
    language,
    setLanguage,
    notifEnabled,
    setNotifEnabled,
  } = useSettingsStore();
  const { user, updateName, logout } = useAuthStore();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") ?? "profile") as Section;
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [nameSaved, setNameSaved] = useState(false);

  const isKo = language === "ko";
  const displayName = user?.name ?? "";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sectionLabel = (section: Section) =>
    isKo
      ? {
          profile: "프로필",
          timetable: "시간표",
          display: "디스플레이",
          notifications: "알림",
          about: "앱 정보",
        }[section]
      : {
          profile: "Profile",
          timetable: "Timetable",
          display: "Display",
          notifications: "Notifications",
          about: "About",
        }[section];

  const notifLabel = (type: SettingsNotificationType) =>
    isKo
      ? {
          room_invite: ["방 초대", "누군가 방에 초대했을 때"],
          friend_request: ["친구 요청", "친구 요청을 받았을 때"],
          meeting_confirmed: ["미팅 확정", "방에서 미팅 시간이 확정되었을 때"],
          member_joined: ["새 멤버 참여", "방에 새로운 멤버가 참여했을 때"],
          schedule_conflict: ["일정 충돌 감지", "일정 충돌이 감지되었을 때"],
        }[type]
      : {
          room_invite: ["Room invite", "When someone invites you to a room"],
          friend_request: ["Friend request", "When you receive a friend request"],
          meeting_confirmed: ["Meeting confirmed", "When a meeting is confirmed in a room"],
          member_joined: ["Member joined", "When a member joins your room"],
          schedule_conflict: ["Schedule conflict", "When a schedule conflict is detected"],
        }[type];

  const saveName = () => {
    if (!nameInput.trim()) return;
    updateName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="glass-nav shrink-0 border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {isKo ? "설정" : "Settings"}
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <nav className="flex w-full shrink-0 gap-2 overflow-x-auto border-b border-outline-variant/10 px-4 py-3 md:w-48 md:flex-col md:gap-0.5 md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-5">
          {(["profile", "timetable", "display", "notifications", "about"] as Section[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                activeSection === section
                  ? "bg-surface-container-lowest text-primary shadow-ambient"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {sectionLabel(section)}
            </button>
          ))}
        </nav>

        <main className="mobile-page-safe flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8">
          <div className="flex max-w-2xl flex-col gap-6">
            {activeSection === "profile" ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                    {isKo ? "프로필" : "Profile"}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isKo ? "계정 정보를 관리해 보세요." : "Manage your account information."}
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-lg font-bold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface">{displayName}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{isKo ? "프리미엄" : "Premium"}</p>
                  </div>
                </div>

                <Card title={isKo ? "프로필" : "Profile"}>
                  <div className="px-5 py-4">
                    <label className="label-field">{isKo ? "표시 이름" : "Display name"}</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={nameInput}
                        onChange={(event) => {
                          setNameInput(event.target.value);
                          setNameSaved(false);
                        }}
                        className="field flex-1 !py-2.5 text-sm"
                        onKeyDown={(event) => event.key === "Enter" && saveName()}
                      />
                      <button
                        onClick={saveName}
                        disabled={!nameInput.trim() || nameInput.trim() === displayName}
                        className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          nameSaved ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                        }`}
                      >
                        {nameSaved ? (isKo ? "저장됨" : "Saved") : (isKo ? "저장" : "Save")}
                      </button>
                    </div>
                  </div>
                  <Row label={isKo ? "계정 유형" : "Account type"}>
                    <span className="rounded-full bg-primary-fixed px-2.5 py-1 text-xs font-semibold text-primary">
                      {isKo ? "프리미엄" : "Premium"}
                    </span>
                  </Row>
                </Card>

                <Card title={isKo ? "계정 관리" : "Account Management"}>
                  <Row label={isKo ? "로그아웃" : "Log out"} desc={isKo ? "현재 기기에서 로그아웃합니다." : "Log out from this device."}>
                    <button onClick={() => logout()} className="rounded-xl border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container">
                      {isKo ? "로그아웃" : "Log out"}
                    </button>
                  </Row>
                  <Row label={isKo ? "계정 삭제" : "Delete account"} desc={isKo ? "모든 데이터가 영구적으로 삭제됩니다." : "All data will be permanently deleted."}>
                    <button className="rounded-xl border border-error/30 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/5">
                      {isKo ? "삭제" : "Delete"}
                    </button>
                  </Row>
                </Card>
              </>
            ) : null}

            {activeSection === "timetable" ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                    {isKo ? "시간표" : "Timetable"}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isKo ? "시간표 표시 방식을 조정해 보세요." : "Adjust how your timetable is displayed."}
                  </p>
                </div>

                <Card title={isKo ? "주간 설정" : "Weekly settings"}>
                  <Row label={isKo ? "주의 시작 요일" : "Start of week"} desc={isKo ? "캘린더의 첫 열에 표시됩니다." : "Shown in the first column."}>
                    <div className="flex gap-1">
                      {(["mon", "sun"] as const).map((value) => (
                        <button
                          key={value}
                          onClick={() => setStartOfWeek(value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            startOfWeek === value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {value === "mon" ? (isKo ? "월요일" : "Monday") : (isKo ? "일요일" : "Sunday")}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label={isKo ? "주말 표시" : "Show weekends"} desc={isKo ? "토요일과 일요일 열을 보여줍니다." : "Display Saturday and Sunday."}>
                    <Toggle checked={showWeekends} onChange={setShowWeekends} />
                  </Row>
                </Card>

                <Card title={isKo ? "표시 시간 범위" : "Visible time range"}>
                  <Row label={isKo ? "시작 시간" : "Start time"}>
                    <div className="flex flex-wrap justify-end gap-1">
                      {[6, 7, 8, 9].map((hour) => (
                        <button
                          key={hour}
                          onClick={() => hour < gridEnd && setGridStart(hour)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            gridStart === hour ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {isKo ? `${hour}시` : `${hour}:00`}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label={isKo ? "종료 시간" : "End time"}>
                    <div className="flex flex-wrap justify-end gap-1">
                      {[20, 21, 22, 24].map((hour) => (
                        <button
                          key={hour}
                          onClick={() => hour > gridStart && setGridEnd(hour)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            gridEnd === hour ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {hour === 24 ? (isKo ? "자정" : "Midnight") : isKo ? `${hour}시` : `${hour}:00`}
                        </button>
                      ))}
                    </div>
                  </Row>
                </Card>
              </>
            ) : null}

            {activeSection === "display" ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                    {isKo ? "디스플레이" : "Display"}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isKo ? "테마와 언어를 바꿔 보세요." : "Choose your theme and language."}
                  </p>
                </div>

                <Card title={isKo ? "앱 테마" : "App theme"}>
                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                    {(["light", "dark", "system"] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition-all ${
                          theme === value ? "border-primary bg-primary-fixed/30 text-primary" : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:border-outline-variant/60"
                        }`}
                      >
                        {value === "light" ? (isKo ? "라이트" : "Light") : value === "dark" ? (isKo ? "다크" : "Dark") : isKo ? "시스템" : "System"}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card title={isKo ? "언어" : "Language"} desc={isKo ? "앱에서 사용할 언어를 고르세요." : "Choose the language used in the app."}>
                  {(["ko", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex w-full items-center justify-between border-t border-outline-variant/10 px-5 py-4 transition-colors hover:bg-surface-container-low first:border-t-0 ${
                        language === lang ? "text-primary" : "text-on-surface"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold">{lang === "ko" ? (isKo ? "한국어" : "Korean") : "English"}</p>
                        <p className="mt-0.5 text-[10px] text-on-surface-variant">{lang === "ko" ? "Korean" : isKo ? "영어" : "English"}</p>
                      </div>
                      {language === lang ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </button>
                  ))}
                </Card>
              </>
            ) : null}

            {activeSection === "notifications" ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                    {isKo ? "알림" : "Notifications"}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isKo ? "받고 싶은 알림을 선택해 보세요." : "Choose which updates you want to receive."}
                  </p>
                </div>

                <Card title={isKo ? "알림 수신 설정" : "Notification settings"}>
                  {NOTIF_TYPES.map((type) => {
                    const [label, desc] = notifLabel(type);
                    return (
                      <Row key={type} label={label} desc={desc}>
                        <Toggle checked={notifEnabled[type]} onChange={(value) => setNotifEnabled(type, value)} />
                      </Row>
                    );
                  })}
                </Card>
              </>
            ) : null}

            {activeSection === "about" ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                    {isKo ? "앱 정보" : "About"}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isKo ? "Weekedule 관련 정보를 확인해 보세요." : "Information about Weekedule."}
                  </p>
                </div>

                <Card title={isKo ? "버전 정보" : "Version info"}>
                  <Row label={isKo ? "버전" : "Version"}><span className="font-mono text-sm text-on-surface-variant">1.0.0</span></Row>
                  <Row label={isKo ? "빌드" : "Build"}><span className="font-mono text-sm text-on-surface-variant">2026.04</span></Row>
                  <Row label={isKo ? "플랫폼" : "Platform"}><span className="text-sm text-on-surface-variant">Web</span></Row>
                </Card>

                <Card title={isKo ? "법적 정보" : "Legal"}>
                  <Link href="/terms" className="block transition-colors hover:bg-surface-container">
                    <Row label={isKo ? "서비스 이용약관" : "Terms of Service"} />
                  </Link>
                  <Link href="/privacy" className="block transition-colors hover:bg-surface-container">
                    <Row label={isKo ? "개인정보 처리방침" : "Privacy Policy"} />
                  </Link>
                  <Row label={isKo ? "오픈소스 라이선스" : "Open-source licenses"}>
                    <span className="text-xs text-on-surface-variant">Next.js, Prisma, Tailwind CSS, Zustand, jose</span>
                  </Row>
                </Card>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
