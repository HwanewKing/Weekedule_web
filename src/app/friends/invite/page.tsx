import FriendInviteClient from "@/components/friends/FriendInviteClient";

export default async function FriendsInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const params = await searchParams;
  const ref = params.ref;
  const token = Array.isArray(ref) ? (ref[0] ?? "") : (ref ?? "");

  return <FriendInviteClient token={token} />;
}
