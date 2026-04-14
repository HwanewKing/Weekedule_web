"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/settingsStore";

const LABELS = {
  ko: {
    title: "문의하기",
    subtitle: "사용 중 불편한 점, 기능 제안, 일반 문의를 편하게 남겨 주세요.",
    typeLabel: "문의 유형",
    types: {
      bug: "버그 신고",
      suggestion: "기능 제안",
      other: "일반 문의",
    },
    subjectLabel: "제목",
    subjectPlaceholder: "간단한 제목을 입력해 주세요.",
    messageLabel: "내용",
    messagePlaceholder: "문의 내용을 자세히 적어 주세요...",
    send: "문의 보내기",
    sending: "전송 중...",
    sent: "접수 완료",
    error: "전송에 실패했어요. 잠시 후 다시 시도해 주세요.",
  },
  en: {
    title: "Contact",
    subtitle: "Send bug reports, feature ideas, or general questions.",
    typeLabel: "Category",
    types: {
      bug: "Bug Report",
      suggestion: "Feature Request",
      other: "General Inquiry",
    },
    subjectLabel: "Subject",
    subjectPlaceholder: "Add a short subject line",
    messageLabel: "Message",
    messagePlaceholder: "Please describe your inquiry in detail...",
    send: "Send Inquiry",
    sending: "Sending...",
    sent: "Received",
    error: "Sending failed. Please try again.",
  },
} as const;

type FeedbackType = "bug" | "suggestion" | "other";
type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackPage() {
  const { language } = useSettingsStore();
  const t = LABELS[language];

  const [fbType, setFbType] = useState<FeedbackType>("bug");
  const [fbSubject, setFbSubject] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSend = async () => {
    if (!fbMessage.trim()) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: fbType,
          subject: fbSubject,
          message: fbMessage,
        }),
      });

      if (!res.ok) throw new Error();

      setStatus("sent");
      setFbSubject("");
      setFbMessage("");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      <header className="glass-nav z-30 flex shrink-0 items-center border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
      </header>

      <div className="shrink-0 px-8 pb-4 pt-6">
        <h3 className="text-4xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">{t.subtitle}</p>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6 md:px-8">
        <div className="flex max-w-lg flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-5">
            <p className="text-xs font-semibold text-on-surface-variant">{t.typeLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(["bug", "suggestion", "other"] as FeedbackType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFbType(type);
                    if (status === "sent") setStatus("idle");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    fbType === type
                      ? "bg-primary text-on-primary shadow-ambient"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {t.types[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-5">
            <label className="text-xs font-semibold text-on-surface-variant">{t.subjectLabel}</label>
            <input
              type="text"
              value={fbSubject}
              onChange={(event) => {
                setFbSubject(event.target.value);
                if (status === "sent") setStatus("idle");
              }}
              placeholder={t.subjectPlaceholder}
              className="w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-5">
            <label className="text-xs font-semibold text-on-surface-variant">{t.messageLabel}</label>
            <textarea
              value={fbMessage}
              onChange={(event) => {
                setFbMessage(event.target.value);
                if (status === "sent") setStatus("idle");
              }}
              placeholder={t.messagePlaceholder}
              rows={7}
              maxLength={2000}
              className="w-full resize-none rounded-xl bg-surface-container px-4 py-3 text-sm leading-relaxed text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-right text-xs text-on-surface-variant/50">{fbMessage.length} / 2000</p>
          </div>

          <button
            onClick={handleSend}
            disabled={status === "sending" || status === "sent" || !fbMessage.trim()}
            className={`w-full rounded-2xl py-3 text-sm font-bold transition-all active:scale-95 ${
              status === "sent"
                ? "bg-green-500/20 text-green-500"
                : status === "error"
                  ? "bg-red-500/20 text-red-500"
                  : "btn-gradient text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            {status === "sending"
              ? t.sending
              : status === "sent"
                ? t.sent
                : status === "error"
                  ? t.error
                  : t.send}
          </button>
        </div>
      </main>
    </>
  );
}
