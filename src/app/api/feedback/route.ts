import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { findUserById } from "@/server/services/userService";



const TO_EMAIL = "udown0109@naver.com";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const user = await findUserById(userId);

    const { type, subject, message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
    }

    const typeLabel: Record<string, string> = {
      bug:        "🐛 버그 신고",
      suggestion: "💡 기능 제안",
      other:      "💬 기타 의견",
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Weekedule Feedback <feedback@weekedule.com>",
        to: [TO_EMAIL],
        subject: `[Weekedule ${typeLabel[type] ?? "의견"}] ${subject || "(제목 없음)"}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#2a4dd7;margin-bottom:4px;">Weekedule 피드백</h2>
            <p style="color:#888;font-size:13px;margin-top:0;">${new Date().toLocaleString("ko-KR")}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#555;width:80px;vertical-align:top;font-weight:600;">유형</td><td style="padding:8px 0;">${typeLabel[type] ?? type}</td></tr>
              <tr><td style="padding:8px 0;color:#555;vertical-align:top;font-weight:600;">제목</td><td style="padding:8px 0;">${subject || "(없음)"}</td></tr>
              <tr><td style="padding:8px 0;color:#555;vertical-align:top;font-weight:600;">보낸 사람</td><td style="padding:8px 0;">${user?.name ?? "알 수 없음"} (${user?.email ?? userId})</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
            <div style="background:#f8f8f8;border-radius:8px;padding:16px;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message.trim()}</div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[POST /feedback] Resend error:", err);
      return NextResponse.json({ error: "메일 전송에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /feedback]", err);
    return NextResponse.json({ error: "메일 전송에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
