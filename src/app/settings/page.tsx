"use client";

import { useState } from "react";
import { useSettingsStore, Theme, Language } from "@/lib/settingsStore";
import { useAuthStore } from "@/lib/authStore";
import { NotificationType } from "@/lib/notificationStore";

// ── i18n ────────────────────────────────────────────────────────
const T = {
  ko: {
    pageTitle: "설정",
    sections: { profile: "프로필", timetable: "시간표", display: "디스플레이", notifications: "알림", about: "앱 정보" },
    profile: {
      title: "프로필", subtitle: "내 계정 정보를 관리하세요",
      displayName: "표시 이름", accountType: "계정 유형",
      save: "저장", saved: "저장됨 ✓",
      password: "비밀번호 변경", passwordSubtitle: "정기적으로 변경하면 보안에 도움이 돼요",
      current: "현재 비밀번호", newPw: "새 비밀번호", confirm: "비밀번호 확인",
      pwSave: "변경하기", pwSaved: "변경됨 ✓", pwMismatch: "비밀번호가 일치하지 않아요",
      accountManage: "계정 관리", logout: "로그아웃", logoutDesc: "현재 기기에서 로그아웃합니다",
      deleteAccount: "계정 삭제", deleteDesc: "모든 데이터가 영구적으로 삭제돼요",
    },
    timetable: {
      title: "시간표", subtitle: "시간표 그리드 표시 방식을 설정하세요",
      weeklyTitle: "주간 설정", startOfWeek: "주 시작 요일", startOfWeekDesc: "캘린더 첫 번째 열의 요일",
      mon: "월요일", sun: "일요일",
      showWeekends: "주말 표시", showWeekendsDesc: "토·일요일 열을 시간표에 표시합니다",
      gridTitle: "그리드 시간 범위", gridDesc: "시간표에 표시할 시간 구간을 설정하세요",
      gridStart: "시작 시간", gridEnd: "종료 시간", midnight: "자정",
    },
    display: {
      title: "디스플레이", subtitle: "앱 테마와 언어를 설정하세요",
      themeTitle: "앱 테마",
      light: "라이트", dark: "다크", system: "시스템",
      lightDesc: "항상 밝은 테마", darkDesc: "항상 어두운 테마", systemDesc: "기기 설정을 따름",
      langTitle: "언어", langDesc: "앱에서 사용할 언어를 선택하세요",
    },
    notifications: {
      title: "알림", subtitle: "받을 알림 종류를 선택하세요",
      sectionTitle: "알림 수신 설정",
    },
    about: {
      title: "앱 정보", subtitle: "Weekedule에 대한 정보",
      versionTitle: "버전 정보", version: "버전", build: "빌드", platform: "플랫폼",
      legalTitle: "법적 정보", tos: "서비스 이용약관", privacy: "개인정보 처리방침", oss: "오픈소스 라이선스",
    },
  },
  en: {
    pageTitle: "Settings",
    sections: { profile: "Profile", timetable: "Timetable", display: "Display", notifications: "Notifications", about: "About" },
    profile: {
      title: "Profile", subtitle: "Manage your account information",
      displayName: "Display name", accountType: "Account type",
      save: "Save", saved: "Saved ✓",
      password: "Change password", passwordSubtitle: "Changing your password regularly improves security",
      current: "Current password", newPw: "New password", confirm: "Confirm password",
      pwSave: "Change", pwSaved: "Changed ✓", pwMismatch: "Passwords don't match",
      accountManage: "Account management", logout: "Log out", logoutDesc: "Log out from this device",
      deleteAccount: "Delete account", deleteDesc: "All data will be permanently deleted",
    },
    timetable: {
      title: "Timetable", subtitle: "Configure the timetable grid display",
      weeklyTitle: "Weekly settings", startOfWeek: "Start of week", startOfWeekDesc: "First column day in the calendar",
      mon: "Monday", sun: "Sunday",
      showWeekends: "Show weekends", showWeekendsDesc: "Show Saturday & Sunday columns",
      gridTitle: "Grid time range", gridDesc: "Set the visible time range in the timetable",
      gridStart: "Start time", gridEnd: "End time", midnight: "Midnight",
    },
    display: {
      title: "Display", subtitle: "Set the app theme and language",
      themeTitle: "App theme",
      light: "Light", dark: "Dark", system: "System",
      lightDesc: "Always light", darkDesc: "Always dark", systemDesc: "Follow device setting",
      langTitle: "Language", langDesc: "Select the language for the app",
    },
    notifications: {
      title: "Notifications", subtitle: "Choose which notifications to receive",
      sectionTitle: "Notification settings",
    },
    about: {
      title: "About", subtitle: "Information about Weekedule",
      versionTitle: "Version info", version: "Version", build: "Build", platform: "Platform",
      legalTitle: "Legal", tos: "Terms of Service", privacy: "Privacy Policy", oss: "Open-source licenses",
    },
  },
} as const;

// ── 알림 레이블 ──────────────────────────────────────────────────
const NOTIF_LABELS: Record<NotificationType, Record<Language, { label: string; desc: string }>> = {
  room_invite:       { ko: { label: "룸 초대",        desc: "누군가 룸에 초대했을 때" },         en: { label: "Room invite",       desc: "When someone invites you to a room" } },
  friend_request:    { ko: { label: "친구 요청",      desc: "친구 요청을 받았을 때" },           en: { label: "Friend request",    desc: "When you receive a friend request" } },
  meeting_confirmed: { ko: { label: "미팅 확정",      desc: "룸에서 미팅이 확정됐을 때" },       en: { label: "Meeting confirmed", desc: "When a meeting is confirmed in a room" } },
  member_joined:     { ko: { label: "새 멤버 참여",   desc: "내 룸에 멤버가 참여했을 때" },      en: { label: "Member joined",     desc: "When a member joins your room" } },
  schedule_conflict: { ko: { label: "일정 충돌 감지", desc: "스케줄 겹침이 감지됐을 때" },       en: { label: "Schedule conflict", desc: "When a schedule conflict is detected" } },
};
const NOTIF_TYPES: NotificationType[] = ["room_invite", "friend_request", "meeting_confirmed", "member_joined", "schedule_conflict"];

// ── UI Primitives ────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 40,
        height: 24,
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 0.2s",
        backgroundColor: checked ? "var(--color-primary)" : "var(--color-surface-container-high)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: 0,
          width: 20,
          height: 20,
          borderRadius: 9999,
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transition: "transform 0.2s",
          transform: checked ? "translateX(18px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{title}</h2>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-t border-outline-variant/10 first:border-t-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

// ── 테마 카드 ────────────────────────────────────────────────────
function ThemeCard({ value, active, label, desc, onClick }: {
  value: Theme; active: boolean; label: string; desc: string; onClick: () => void;
}) {
  const previews: Record<Theme, React.ReactNode> = {
    light: (
      <div className="w-full h-14 rounded-xl bg-[#f3f3f5] border border-[#e2e2e4] flex flex-col gap-1 p-2 overflow-hidden">
        <div className="h-2 w-10 bg-[#2a4dd7] rounded-full" />
        <div className="h-1.5 w-14 bg-[#e8e8ea] rounded-full" />
        <div className="h-1.5 w-10 bg-[#e8e8ea] rounded-full" />
      </div>
    ),
    dark: (
      <div className="w-full h-14 rounded-xl bg-[#1a1c1f] border border-[#3a3d45] flex flex-col gap-1 p-2 overflow-hidden">
        <div className="h-2 w-10 bg-[#b9c3ff] rounded-full" />
        <div className="h-1.5 w-14 bg-[#282b2f] rounded-full" />
        <div className="h-1.5 w-10 bg-[#282b2f] rounded-full" />
      </div>
    ),
    system: (
      <div className="w-full h-14 rounded-xl border border-[#e2e2e4] overflow-hidden flex">
        <div className="flex-1 bg-[#f3f3f5] flex flex-col gap-1 p-2">
          <div className="h-2 w-5 bg-[#2a4dd7] rounded-full" />
          <div className="h-1.5 w-7 bg-[#e8e8ea] rounded-full" />
        </div>
        <div className="flex-1 bg-[#1a1c1f] flex flex-col gap-1 p-2">
          <div className="h-2 w-5 bg-[#b9c3ff] rounded-full" />
          <div className="h-1.5 w-7 bg-[#282b2f] rounded-full" />
        </div>
      </div>
    ),
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all text-left ${
        active ? "border-primary bg-primary-fixed/30" : "border-outline-variant/20 hover:border-outline-variant/60 bg-surface-container"
      }`}
    >
      {previews[value]}
      <div>
        <p className={`text-xs font-bold ${active ? "text-primary" : "text-on-surface"}`}>{label}</p>
        <p className="text-[10px] text-on-surface-variant mt-0.5">{desc}</p>
      </div>
      {active && (
        <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center self-end -mt-1">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ── 섹션 네비 ────────────────────────────────────────────────────
type SettingSection = "profile" | "timetable" | "display" | "notifications" | "about";

const SECTION_ICONS: Record<SettingSection, React.ReactNode> = {
  profile: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  timetable: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  display: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  notifications: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  about: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── 메인 ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const {
    startOfWeek, setStartOfWeek,
    showWeekends, setShowWeekends,
    gridStart, setGridStart,
    gridEnd, setGridEnd,
    theme, setTheme,
    language, setLanguage,
    notifEnabled, setNotifEnabled,
  } = useSettingsStore();

  const { user, updateName, logout } = useAuthStore();
  const displayName = user?.name ?? "";

  const t = T[language];

  const [activeSection, setActiveSection] = useState<SettingSection>("profile");
  const [nameInput,     setNameInput]     = useState(displayName);
  const [nameSaved,     setNameSaved]     = useState(false);

  // 비밀번호 상태
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwCurrent,  setPwCurrent]  = useState("");
  const [pwNew,      setPwNew]      = useState("");
  const [pwConfirm,  setPwConfirm]  = useState("");
  const [pwStatus,   setPwStatus]   = useState<"idle" | "saved" | "mismatch">("idle");

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    updateName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleChangePw = () => {
    if (pwNew !== pwConfirm) { setPwStatus("mismatch"); return; }
    if (!pwCurrent || !pwNew) return;
    setPwStatus("saved");
    setPwCurrent(""); setPwNew(""); setPwConfirm("");
    setTimeout(() => {
      setPwStatus("idle");
      setShowPwForm(false);
    }, 2000);
  };

  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const SECTIONS: SettingSection[] = ["profile", "timetable", "display", "notifications", "about"];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="glass-nav border-b border-outline-variant/10 px-8 py-3 shrink-0">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.pageTitle}
        </h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 섹션 네비 */}
        <nav className="w-48 shrink-0 border-r border-outline-variant/10 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeSection === s
                  ? "bg-surface-container-lowest text-primary shadow-ambient"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className={activeSection === s ? "text-primary" : ""}>{SECTION_ICONS[s]}</span>
              {t.sections[s]}
            </button>
          ))}
        </nav>

        {/* 우측 컨텐츠 */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-lg flex flex-col gap-6">

            {/* ── 프로필 ── */}
            {activeSection === "profile" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.profile.title}</h1>
                  <p className="text-sm text-on-surface-variant mt-1">{t.profile.subtitle}</p>
                </div>

                {/* 아바타 */}
                <div className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-lg font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface">{displayName}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Premium Account</p>
                  </div>
                </div>

                {/* 계정 정보 */}
                <Section title={t.profile.title}>
                  <div className="px-5 py-4">
                    <label className="label-field">{t.profile.displayName}</label>
                    <div className="flex gap-2">
                      <input
                        value={nameInput}
                        onChange={(e) => { setNameInput(e.target.value); setNameSaved(false); }}
                        className="field flex-1 !py-2.5 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={!nameInput.trim() || nameInput.trim() === displayName}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          nameSaved ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                        }`}
                      >
                        {nameSaved ? t.profile.saved : t.profile.save}
                      </button>
                    </div>
                  </div>
                  <Row label={t.profile.accountType}>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-primary-fixed text-primary rounded-full">Premium</span>
                  </Row>
                </Section>

                {/* 비밀번호 변경 */}
                <Section title={t.profile.password} description={t.profile.passwordSubtitle}>
                  <Row label={t.profile.password} description={t.profile.passwordSubtitle}>
                    <button
                      onClick={() => { setShowPwForm(!showPwForm); setPwStatus("idle"); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        showPwForm
                          ? "bg-surface-container-high text-on-surface-variant"
                          : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {showPwForm ? (language === "ko" ? "닫기" : "Close") : t.profile.pwSave}
                    </button>
                  </Row>
                  {showPwForm && (
                    <div className="px-5 pb-5 flex flex-col gap-3 border-t border-outline-variant/10">
                      <div className="pt-1">
                        <label className="label-field">{t.profile.current}</label>
                        <input type="password" value={pwCurrent} onChange={(e) => { setPwCurrent(e.target.value); setPwStatus("idle"); }} className="field !py-2.5 text-sm" />
                      </div>
                      <div>
                        <label className="label-field">{t.profile.newPw}</label>
                        <input type="password" value={pwNew} onChange={(e) => { setPwNew(e.target.value); setPwStatus("idle"); }} className="field !py-2.5 text-sm" />
                      </div>
                      <div>
                        <label className="label-field">{t.profile.confirm}</label>
                        <input type="password" value={pwConfirm} onChange={(e) => { setPwConfirm(e.target.value); setPwStatus("idle"); }} className="field !py-2.5 text-sm" />
                      </div>
                      {pwStatus === "mismatch" && (
                        <p className="text-xs text-error font-semibold">{t.profile.pwMismatch}</p>
                      )}
                      <button
                        onClick={handleChangePw}
                        disabled={!pwCurrent || !pwNew || !pwConfirm}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          pwStatus === "saved" ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                        }`}
                      >
                        {pwStatus === "saved" ? t.profile.pwSaved : t.profile.pwSave}
                      </button>
                    </div>
                  )}
                </Section>

                {/* 계정 관리 */}
                <Section title={t.profile.accountManage}>
                  <Row label={t.profile.logout} description={t.profile.logoutDesc}>
                    <button
                      onClick={() => logout()}
                      className="px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      {t.profile.logout}
                    </button>
                  </Row>
                  <Row label={t.profile.deleteAccount} description={t.profile.deleteDesc}>
                    <button className="px-3 py-1.5 rounded-xl border border-error/30 text-xs font-semibold text-error hover:bg-error/5 transition-colors">
                      {language === "ko" ? "삭제" : "Delete"}
                    </button>
                  </Row>
                </Section>
              </>
            )}

            {/* ── 시간표 ── */}
            {activeSection === "timetable" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.timetable.title}</h1>
                  <p className="text-sm text-on-surface-variant mt-1">{t.timetable.subtitle}</p>
                </div>

                <Section title={t.timetable.weeklyTitle}>
                  <Row label={t.timetable.startOfWeek} description={t.timetable.startOfWeekDesc}>
                    <div className="flex gap-1">
                      {(["mon", "sun"] as const).map((v) => (
                        <button key={v} onClick={() => setStartOfWeek(v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${startOfWeek === v ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                          {v === "mon" ? t.timetable.mon : t.timetable.sun}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label={t.timetable.showWeekends} description={t.timetable.showWeekendsDesc}>
                    <Toggle checked={showWeekends} onChange={setShowWeekends} />
                  </Row>
                </Section>

                <Section title={t.timetable.gridTitle} description={t.timetable.gridDesc}>
                  <Row label={t.timetable.gridStart}>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {[6, 7, 8, 9].map((h) => (
                        <button key={h} onClick={() => h < gridEnd && setGridStart(h)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${gridStart === h ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                          {h}{language === "ko" ? "시" : ":00"}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label={t.timetable.gridEnd}>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {[20, 21, 22, 24].map((h) => (
                        <button key={h} onClick={() => h > gridStart && setGridEnd(h)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${gridEnd === h ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
                          {h === 24 ? t.timetable.midnight : `${h}${language === "ko" ? "시" : ":00"}`}
                        </button>
                      ))}
                    </div>
                  </Row>
                </Section>
              </>
            )}

            {/* ── 디스플레이 ── */}
            {activeSection === "display" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.display.title}</h1>
                  <p className="text-sm text-on-surface-variant mt-1">{t.display.subtitle}</p>
                </div>

                {/* 테마 */}
                <div>
                  <div className="mb-3">
                    <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.display.themeTitle}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeCard value="light"  active={theme === "light"}  label={t.display.light}  desc={t.display.lightDesc}  onClick={() => setTheme("light")} />
                    <ThemeCard value="dark"   active={theme === "dark"}   label={t.display.dark}   desc={t.display.darkDesc}   onClick={() => setTheme("dark")} />
                    <ThemeCard value="system" active={theme === "system"} label={t.display.system} desc={t.display.systemDesc} onClick={() => setTheme("system")} />
                  </div>
                </div>

                {/* 언어 */}
                <Section title={t.display.langTitle} description={t.display.langDesc}>
                  {(["ko", "en"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full flex items-center justify-between px-5 py-4 border-t border-outline-variant/10 first:border-t-0 transition-colors hover:bg-surface-container-low ${language === lang ? "text-primary" : "text-on-surface"}`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold">{lang === "ko" ? "한국어" : "English"}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{lang === "ko" ? "Korean" : "영어"}</p>
                      </div>
                      {language === lang && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </Section>
              </>
            )}

            {/* ── 알림 ── */}
            {activeSection === "notifications" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.notifications.title}</h1>
                  <p className="text-sm text-on-surface-variant mt-1">{t.notifications.subtitle}</p>
                </div>
                <Section title={t.notifications.sectionTitle}>
                  {NOTIF_TYPES.map((type) => {
                    const { label, desc } = NOTIF_LABELS[type][language];
                    return (
                      <Row key={type} label={label} description={desc}>
                        <Toggle checked={notifEnabled[type]} onChange={(v) => setNotifEnabled(type, v)} />
                      </Row>
                    );
                  })}
                </Section>
              </>
            )}

            {/* ── 앱 정보 ── */}
            {activeSection === "about" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>{t.about.title}</h1>
                  <p className="text-sm text-on-surface-variant mt-1">{t.about.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                  <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>Weekedule</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Orchestrated Flow</p>
                  </div>
                </div>

                <Section title={t.about.versionTitle}>
                  <Row label={t.about.version}><span className="text-sm text-on-surface-variant font-mono">1.0.0</span></Row>
                  <Row label={t.about.build}><span className="text-sm text-on-surface-variant font-mono">2026.04</span></Row>
                  <Row label={t.about.platform}><span className="text-sm text-on-surface-variant">Web</span></Row>
                </Section>

                <Section title={t.about.legalTitle}>
                  <Row label={t.about.tos}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><polyline points="9 18 15 12 9 6" /></svg>
                  </Row>
                  <Row label={t.about.privacy}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><polyline points="9 18 15 12 9 6" /></svg>
                  </Row>
                  <Row label={t.about.oss}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><polyline points="9 18 15 12 9 6" /></svg>
                  </Row>
                </Section>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
