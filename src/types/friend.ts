// 실제 계정 기반 친구 관계

export interface FriendRelation {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  addresseeId: string;
  addresseeName: string;
  addresseeEmail: string;
  status: "pending" | "accepted";
  createdAt: string;
}

/** UI에서 사용하는 친구 객체 (FriendRelation에서 파생) */
export interface Friend {
  userId: string;
  name: string;
  email: string;
  initials: string;
  colorId: string;   // 룸 멤버 색상 (기본값 할당)
  addedAt: string;
}
