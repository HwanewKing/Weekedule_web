import { NextResponse } from "next/server";
import { verifyFriendInviteToken } from "@/server/auth/friendInviteToken";
import { requireAuth } from "@/server/middleware/requireAuth";
import { sendFriendRequestToUser } from "@/server/services/friendService";
import { findUserById } from "@/server/services/userService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { inviterId } = await verifyFriendInviteToken(token);
    const inviter = await findUserById(inviterId);

    if (!inviter) {
      return NextResponse.json(
        { error: "친구 초대 링크를 찾을 수 없어요" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      inviter: {
        id: inviter.id,
        name: inviter.name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "유효하지 않거나 만료된 친구 초대 링크예요" },
      { status: 400 }
    );
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const userId = await requireAuth();
    const { token } = await params;
    const { inviterId } = await verifyFriendInviteToken(token);

    const inviter = await findUserById(inviterId);
    if (!inviter) {
      return NextResponse.json(
        { error: "친구 초대 링크를 찾을 수 없어요", code: "not_found" },
        { status: 404 }
      );
    }

    const result = await sendFriendRequestToUser(userId, inviterId);
    if ("error" in result) {
      const status =
        result.code === "not_found"
          ? 404
          : result.code === "self"
            ? 400
            : 409;

      return NextResponse.json(
        { error: result.error, code: result.code },
        { status }
      );
    }

    return NextResponse.json(
      {
        relation: result.relation,
        autoAccepted: result.autoAccepted ?? false,
      },
      { status: result.autoAccepted ? 200 : 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /api/friends/invite/:token]", err);
    return NextResponse.json(
      { error: "친구 요청을 처리하지 못했어요", code: "server_error" },
      { status: 500 }
    );
  }
}
