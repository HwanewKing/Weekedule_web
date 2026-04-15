import { NextResponse } from "next/server";
import { signInviteToken } from "@/server/auth/inviteToken";
import { requireAuth } from "@/server/middleware/requireAuth";
import { getRoom } from "@/server/services/roomService";

// POST /api/invite { roomId } -> { token }
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required." }, { status: 400 });
    }

    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const isParticipant =
      room.ownerId === userId || room.members.some((member) => member.userId === userId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Only room participants can create invite links." },
        { status: 403 }
      );
    }

    const token = await signInviteToken(roomId);
    return NextResponse.json({ token });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /invite]", err);
    return NextResponse.json(
      { error: "A server error occurred while creating the invite link." },
      { status: 500 }
    );
  }
}
