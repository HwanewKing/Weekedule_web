export const NOTIFICATION_TYPES = [
  "friend_request",
  "friend_accepted",
  "room_invite",
  "meeting_confirmed",
  "member_joined",
  "schedule_conflict",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
