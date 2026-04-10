import { CalendarEvent } from "./event";

export interface Friend {
  id: string;
  name: string;
  initials: string;
  colorId: string;
  addedAt: string;
  events: CalendarEvent[];
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromInitials: string;
  sentAt: string;
}
