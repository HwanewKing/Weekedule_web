"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useRoomPreferencesStore } from "@/lib/roomPreferencesStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { getMemberStyle, getRoomColorHex, hexToRgba, type Room } from "@/types/room";
import RoomIconEl from "./RoomIcon";
import RoomPersonalizeModal from "./RoomPersonalizeModal";

interface RoomCardProps {
  room: Room;
  featured?: boolean;
}

export default function RoomCard({ room, featured = false }: RoomCardProps) {
  const { user } = useAuthStore();
  const { language } = useSettingsStore();
  const { getRoomPreference } = useRoomPreferencesStore();
  const pref = getRoomPreference(user?.id, room.id);
  const hex = getRoomColorHex(pref?.color ?? room.color);
  const extra = room.members.length > 3 ? room.members.length - 3 : 0;
  const visible = room.members.slice(0, 3);
  const nextSyncLabel = language === "ko" ? "다음 동기화" : "Next Sync";
  const openRoomLabel = language === "ko" ? "룸 열기" : "Open Room";
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <>
      <Link
        href={`/rooms/${room.id}`}
        className={`group relative flex flex-col rounded-3xl bg-surface-container-lowest p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-ambient ${
          featured ? "md:col-span-2" : ""
        }`}
      >
        <div
          className="absolute left-0 top-10 h-10 w-[3px] rounded-r-full"
          style={{ backgroundColor: hex }}
        />

        <div className={featured ? "flex flex-col gap-8 md:flex-row" : "flex h-full flex-col"}>
          <div className="flex flex-1 flex-col">
            <div className="mb-5 flex items-start justify-between">
              <div
                className="rounded-2xl p-3"
                style={{ backgroundColor: hexToRgba(hex, 0.12), color: hex }}
              >
                {pref?.icon ? (
                  <RoomIconEl icon={pref.icon} />
                ) : (
                  <RoomIconEl icon={room.icon} />
                )}
              </div>

              <button
                onClick={(event) => {
                  event.preventDefault();
                  setManageOpen(true);
                }}
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                aria-label="Manage room"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            <h4
              className="mb-1.5 text-base font-bold leading-tight text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {room.name}
            </h4>
            <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">
              {pref?.memo || room.description}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {visible.map((member) => (
                  <div
                    key={member.id}
                    style={getMemberStyle(member.colorId)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest text-[10px] font-bold"
                    title={member.name}
                  >
                    {member.initials[0]}
                  </div>
                ))}
                {extra > 0 ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
                    +{extra}
                  </div>
                ) : null}
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{ backgroundColor: hexToRgba(hex, 0.12), color: hex }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          {featured && room.nextSync ? (
            <div className="flex w-full flex-col justify-end gap-3 md:w-56">
              <div className="rounded-2xl bg-surface-container-low p-4">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {nextSyncLabel}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-bold text-on-surface">
                    {room.nextSyncDay}, {room.nextSync}
                  </span>
                </div>
              </div>
              <button
                onClick={(event) => {
                  event.preventDefault();
                }}
                className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-xs font-bold transition-colors"
                style={{ color: hex, borderColor: hexToRgba(hex, 0.2) }}
              >
                {openRoomLabel}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </Link>

      <RoomPersonalizeModal room={room} open={manageOpen} onClose={() => setManageOpen(false)} />
    </>
  );
}
