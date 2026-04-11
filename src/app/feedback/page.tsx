"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/settingsStore";

const LABELS = {
  ko: {
    title: "피드백",
    subtitle: "버그 신고, 기능 제안, 기타 의견을 보내주세요",
    typeLabel: "유형",
    types: { bug: "🐛 버그 신고", suggestion: "💡 기능 제안", other: "💬 기타 의견" },
    subjectLabel: "제목",
    subjectPlaceholder: "간단한 제목을 입력해주세요",
    messageLabel: "내용",
    messagePlaceholder: "자세한 내용을 입력해주세요...",
    send: "전송하기",
    sending: "전송 중...",
    sent: "✓ 전송 완료",
    error: "전송 실패 — 다시 시도해주세요",
  },
  en: {
    title: "Feedback",
    subtitle: "Send us bug reports, feature requests, or general feedback",
    typeLabel: "Type",
    types: { bug: "🐛 Bug Report", suggestion: "💡 Feature Request", other: "💬 Other" },
    subjectLabel: "Subject",
    subjectPlaceholder: "Brief subject line",
    messageLabel: "Message",
    messagePlaceholder: "Please describe in detail...",
    send: "Send",
    sending: "Sending...",
    sent: "✓ Sent",
    error: "Failed — please try again",
  },
};

type FeedbackType = "bug" | "suggestion" | "other";
type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackPage() {
  const { language } = useSettingsStore();
  const t = LABELS[language];

  const [fbType, setFbType]       = useState<FeedbackType>("bug");
  const [fbSubject, setFbSubject] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [status, setStatus]       = useState<Status>("idle");

  const handleSend = async () => {
    if (!fbMessage.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: fbType, subject: fbSubject, message: fbMessage }),
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
      {/* Topbar */}
      <header className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center shrink-0 z-30">
        <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
      </header>

      {/* Page header */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h3 className="text-4xl font-extrabold text-on-surface tracking-tight" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">{t.subtitle}</p>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-lg flex flex-col gap-5">

          {/* Type selector */}
          <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-on-surface-variant">{t.typeLabel}</p>
            <div className="flex gap-2 flex-wrap">
              {(["bug", "suggestion", "other"] as FeedbackType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setFbType(type); if (status === "sent") setStatus("idle"); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
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

          {/* Subject */}
          <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">{t.subjectLabel}</label>
            <input
              type="text"
              value={fbSubject}
              onChange={(e) => { setFbSubject(e.target.value); if (status === "sent") setStatus("idle"); }}
              placeholder={t.subjectPlaceholder}
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          {/* Message */}
          <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">{t.messageLabel}</label>
            <textarea
              value={fbMessage}
              onChange={(e) => { setFbMessage(e.target.value); if (status === "sent") setStatus("idle"); }}
              placeholder={t.messagePlaceholder}
              rows={7}
              maxLength={2000}
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none leading-relaxed"
            />
            <p className="text-xs text-on-surface-variant/50 text-right">{fbMessage.length} / 2000</p>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={status === "sending" || status === "sent" || !fbMessage.trim()}
            className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
              status === "sent"
                ? "bg-green-500/20 text-green-500"
                : status === "error"
                ? "bg-red-500/20 text-red-500"
                : "btn-gradient text-on-primary disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {status === "sending" ? t.sending
              : status === "sent" ? t.sent
              : status === "error" ? t.error
              : t.send}
          </button>

        </div>
      </main>
    </>
  );
}
