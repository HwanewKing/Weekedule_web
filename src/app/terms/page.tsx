"use client";

import Link from "next/link";
import { useSettingsStore } from "@/lib/settingsStore";

const T = {
  ko: {
    back: "← 돌아가기",
    title: "서비스 이용약관",
    updated: "최종 수정일: 2026년 4월 13일",
    sections: [
      {
        heading: "제1조 (목적)",
        body: "본 약관은 Weekedule(이하 '서비스')의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
      },
      {
        heading: "제2조 (서비스 내용)",
        body: "Weekedule은 개인 주간 시간표 관리, 친구 추가, 룸(Room)을 통한 그룹 일정 공유 기능을 제공합니다. 서비스의 내용은 운영 정책에 따라 변경될 수 있습니다.",
      },
      {
        heading: "제3조 (이용자의 의무)",
        body: "• 타인의 계정을 도용하거나 허위 정보를 등록해서는 안 됩니다.\n• 서비스를 이용하여 법령 또는 공서양속에 반하는 행위를 해서는 안 됩니다.\n• 서비스의 안정적인 운영을 방해하는 행위를 해서는 안 됩니다.",
      },
      {
        heading: "제4조 (서비스 이용 제한)",
        body: "이용자가 본 약관을 위반하거나 서비스 운영을 방해하는 경우, 사전 통보 없이 서비스 이용이 제한될 수 있습니다.",
      },
      {
        heading: "제5조 (서비스 변경 및 중단)",
        body: "서비스는 운영상 또는 기술상의 이유로 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다. 이 경우 사전에 공지하며, 불가피한 사유가 있을 경우에는 사후 공지할 수 있습니다.",
      },
      {
        heading: "제6조 (면책사항)",
        body: "서비스는 천재지변, 불가항력적 사유, 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다. 서비스에 저장된 데이터의 손실에 대해서도 책임을 지지 않으므로, 중요한 데이터는 별도로 백업하시기 바랍니다.",
      },
      {
        heading: "제7조 (약관의 변경)",
        body: "본 약관은 서비스 내 공지 또는 이메일을 통해 변경 내용을 고지하며, 변경된 약관은 고지 후 7일이 지나면 효력이 발생합니다.",
      },
      {
        heading: "제8조 (준거법)",
        body: "본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이 발생한 경우 관할 법원에 소를 제기할 수 있습니다.",
      },
    ],
  },
  en: {
    back: "← Back",
    title: "Terms of Service",
    updated: "Last updated: April 13, 2026",
    sections: [
      {
        heading: "1. Purpose",
        body: "These Terms govern your use of Weekedule (the 'Service'), including the conditions, procedures, and the rights and responsibilities of users and the Service.",
      },
      {
        heading: "2. Service Description",
        body: "Weekedule provides personal weekly schedule management, friend connections, and group schedule sharing via Rooms. The content of the Service may change according to operational policies.",
      },
      {
        heading: "3. User Obligations",
        body: "• You must not impersonate others or register false information.\n• You must not use the Service for activities that violate laws or public morals.\n• You must not interfere with the stable operation of the Service.",
      },
      {
        heading: "4. Service Restrictions",
        body: "If you violate these Terms or interfere with Service operations, your access may be restricted without prior notice.",
      },
      {
        heading: "5. Service Changes and Suspension",
        body: "The Service may change or suspend all or part of its features for operational or technical reasons. Notice will be provided in advance where possible, or after the fact in unavoidable circumstances.",
      },
      {
        heading: "6. Disclaimer",
        body: "The Service is not liable for disruptions caused by force majeure, circumstances beyond our control, or user error. The Service is not responsible for loss of data stored in the Service — please back up important data separately.",
      },
      {
        heading: "7. Changes to Terms",
        body: "Changes to these Terms will be announced via in-app notice or email. Updated terms take effect 7 days after announcement.",
      },
      {
        heading: "8. Governing Law",
        body: "These Terms are governed by the laws of the Republic of Korea. Disputes arising from use of the Service may be brought before the competent court.",
      },
    ],
  },
} as const;

export default function TermsPage() {
  const { language } = useSettingsStore();
  const t = T[language];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-surface">
      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        <Link href="/settings" className="text-sm text-primary font-semibold hover:underline mb-6 inline-block">
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
