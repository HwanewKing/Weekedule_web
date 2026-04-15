"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InviteModal from "@/components/rooms/InviteModal";
import RoomIconEl from "@/components/rooms/RoomIcon";
import RoomPersonalizeModal from "@/components/rooms/RoomPersonalizeModal";
import ScheduleOverlap from "@/components/rooms/ScheduleOverlap";
import { useAuthStore } from "@/lib/authStore";
import { useRoomPreferencesStore } from "@/lib/roomPreferencesStore";
import { normalizeConfirmedSlot, useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { useWeekedualeStore } from "@/lib/store";
import {
  type ConfirmedSlot,
  HEATMAP_COLOR_OPTIONS,
  MEMBER_COLOR_OPTIONS,
  getMemberStyle,
  getRoomColorHex,
  hexToRgba,
} from "@/types/room";

const T = {
  ko: {
    notFound: "Room not found.",
    backToList: "Back to list",
    memberCount: (count: number) => `${count} member${count !== 1 ? "s" : ""}`,
    tabOverlap: "Schedule Overlap",
    tabMembers: "Team",
    overlapTitle: "Schedule Overlap",
    overlapDesc:
      "Review overlapping schedules and confirm the best times for the room.",
    noMembers: "No members yet",
    noMembersDesc: "Invite members from the Team tab first.",
    goInvite: "Invite Members",
    teamTitle: "Team Management",
    teamDesc: "Update the room name, member colors, and shared settings.",
    eventsRegistered: (count: number) => `${count} event${count !== 1 ? "s" : ""}`,
    noMembersYet: "No members yet.",
    inviteBtn: "Invite Members",
    roomNameLabel: "Room Name",
    roomNamePlaceholder: "Enter room name",
    saveName: "Save Name",
    personalManage: "My Room View",
    heatmapTitle: "Heatmap Color",
    heatmapDesc: "Choose the shared color used in the overlap heatmap.",
    roomSettings: "Room Settings",
    deleteRoom: "Delete Room",
    deleteTitle: "Delete this room?",
    deleteDesc: (name: string) =>
      `Deleting "${name}" ends schedule sharing for every member.\nThis action cannot be undone.`,
    deleteNo: "Cancel",
    deleteYes: "Delete",
    toastDay: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    toastConfirmed: (count: number, slot?: string) =>
      count === 1 && slot ? `${slot} confirmed` : `${count} slots confirmed`,
    toastCancelled: (count: number) => `${count} slots cancelled`,
    toastError: "Room confirm failed.",
    toastSuffix: "",
    changeColor: "Change color",
  },
  en: {
    notFound: "Room not found.",
    backToList: "Back to list",
    memberCount: (count: number) => `${count} member${count !== 1 ? "s" : ""}`,
    tabOverlap: "Schedule Overlap",
    tabMembers: "Team",
    overlapTitle: "Schedule Overlap",
    overlapDesc:
      "Review overlapping schedules and confirm the best times for the room.",
    noMembers: "No members yet",
    noMembersDesc: "Invite members from the Team tab first.",
    goInvite: "Invite Members",
    teamTitle: "Team Management",
    teamDesc: "Update the room name, member colors, and shared settings.",
    eventsRegistered: (count: number) => `${count} event${count !== 1 ? "s" : ""}`,
    noMembersYet: "No members yet.",
    inviteBtn: "Invite Members",
    roomNameLabel: "Room Name",
    roomNamePlaceholder: "Enter room name",
    saveName: "Save Name",
    personalManage: "My Room View",
    heatmapTitle: "Heatmap Color",
    heatmapDesc: "Choose the shared color used in the overlap heatmap.",
    roomSettings: "Room Settings",
    deleteRoom: "Delete Room",
    deleteTitle: "Delete this room?",
    deleteDesc: (name: string) =>
      `Deleting "${name}" ends schedule sharing for every member.\nThis action cannot be undone.`,
    deleteNo: "Cancel",
    deleteYes: "Delete",
    toastDay: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    toastConfirmed: (count: number, slot?: string) =>
      count === 1 && slot ? `${slot} confirmed` : `${count} slots confirmed`,
    toastCancelled: (count: number) => `${count} slots cancelled`,
    toastError: "Room confirm failed.",
    toastSuffix: "",
    changeColor: "Change color",
  },
} as const;

type Tab = "overlap" | "members";

function getSlotKey(slot: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  return `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
}

function buildOptimisticConfirmedSlots(
  currentSlots: ConfirmedSlot[],
  roomId: string,
  newSlots: { dayOfWeek: number; startTime: string; endTime: string }[],
  cancelSlotIds: string[]
) {
  const remainingSlots = currentSlots.filter(
    (slot) => !cancelSlotIds.includes(slot.id)
  );
  const slotMap = new Map(
    remainingSlots.map((slot) => [getSlotKey(slot), slot] as const)
  );

  for (const slot of newSlots) {
    const key = getSlotKey(slot);
    if (slotMap.has(key)) continue;

    slotMap.set(key, {
      id: `optimistic-${key}`,
      roomId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      createdAt: new Date().toISOString(),
    });
  }

  return Array.from(slotMap.values()).sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }
    return left.startTime.localeCompare(right.startTime);
  });
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    rooms,
    updateRoom,
    deleteRoom,
    removeMember,
    updateMemberColor,
    confirmedSlots,
    fetchConfirmedSlots,
    setConfirmedSlots,
  } = useRoomStore();
  const { user } = useAuthStore();
  const { getRoomPreference } = useRoomPreferencesStore();
  const { fetchEvents } = useWeekedualeStore();
  const { language } = useSettingsStore();
  const t = T[language];

  const room = rooms.find((item) => item.id === id);
  const pref = getRoomPreference(user?.id, id);

  const [tab, setTab] = useState<Tab>("overlap");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [confirmed, setConfirmed] = useState<{ label: string } | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roomNameDraft, setRoomNameDraft] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (id) fetchConfirmedSlots(id);
  }, [fetchConfirmedSlots, id]);

  useEffect(() => {
    if (room) setRoomNameDraft(room.name);
  }, [room]);

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-on-surface-variant">{t.notFound}</p>
          <button
            onClick={() => router.push("/rooms")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t.backToList}
          </button>
        </div>
      </div>
    );
  }

  const hex = getRoomColorHex(pref?.color ?? room.color);

  const handleDeleteConfirmed = () => {
    deleteRoom(room.id);
    router.push("/rooms");
  };

  const handleConfirmSchedule = async (
    newSlots: { dayOfWeek: number; startTime: string; endTime: string }[],
    cancelSlotIds: string[]
  ) => {
    if (newSlots.length === 0 && cancelSlotIds.length === 0) return;
    if (isConfirming) return;

    const previousSlots = confirmedSlots[room.id] ?? [];
    const optimisticSlots = buildOptimisticConfirmedSlots(
      previousSlots,
      room.id,
      newSlots,
      cancelSlotIds
    );

    setIsConfirming(true);
    setConfirmedSlots(room.id, optimisticSlots);

    try {
      const response = await fetch(`/api/rooms/${room.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: newSlots, cancelIds: cancelSlotIds }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Room confirm failed:", response.status, errorText);
        setConfirmedSlots(room.id, previousSlots);
        setConfirmed({ label: t.toastError });
        setTimeout(() => setConfirmed(null), 4000);
        return;
      }

      const data = await response.json();
      const allSlots = (data.slots ?? []).map(normalizeConfirmedSlot);
      setConfirmedSlots(room.id, allSlots);

      if (user) {
        void fetchEvents();
      }

      const parts: string[] = [];
      if (newSlots.length > 0) {
        const slotLabel =
          newSlots.length === 1
            ? `${t.toastDay[newSlots[0].dayOfWeek]} ${newSlots[0].startTime}`
            : undefined;
        parts.push(t.toastConfirmed(newSlots.length, slotLabel));
      }
      if (cancelSlotIds.length > 0) {
        parts.push(t.toastCancelled(cancelSlotIds.length));
      }

      setConfirmed({ label: parts.join(" / ") + t.toastSuffix });
      setTimeout(() => setConfirmed(null), 4000);
    } catch (error) {
      console.error("Room confirm crashed:", error);
      setConfirmedSlots(room.id, previousSlots);
      setConfirmed({ label: t.toastError });
      setTimeout(() => setConfirmed(null), 4000);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <header className="glass-nav z-30 flex shrink-0 items-center gap-3 border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <button
          onClick={() => router.push("/rooms")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-high"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: hexToRgba(hex, 0.15), color: hex }}
        >
          <RoomIconEl icon={pref?.icon ?? room.icon} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
            {room.name}
          </h2>
          {pref?.memo ? <p className="truncate text-xs text-on-surface-variant">{pref.memo}</p> : null}
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium text-on-surface-variant">{t.memberCount(room.members.length)}</span>
        </div>

        <button
          onClick={() => setShowPersonalizeModal(true)}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          aria-label={t.personalManage}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </header>

      <div className="shrink-0 px-4 pt-4 sm:px-6 md:px-8">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {([
            ["overlap", t.tabOverlap],
            ["members", t.tabMembers],
          ] as [Tab, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tab === value ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="mobile-page-safe flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8">
        {tab === "overlap" ? (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl" style={{ fontFamily: "var(--font-manrope)" }}>
                {t.overlapTitle}
              </h3>
              <p className="mt-1 max-w-lg text-sm text-on-surface-variant">{t.overlapDesc}</p>
            </div>

            {room.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="mb-1 text-base font-bold text-on-surface">{t.noMembers}</p>
                <p className="mb-4 text-sm text-on-surface-variant">{t.noMembersDesc}</p>
                <button onClick={() => setTab("members")} className="btn-gradient rounded-full px-4 py-2 text-sm font-bold text-on-primary">
                  {t.goInvite}
                </button>
              </div>
            ) : (
              <ScheduleOverlap
                members={room.members}
                heatmapColor={room.heatmapColor}
                confirmedSlots={confirmedSlots[room.id] ?? []}
                onConfirm={handleConfirmSchedule}
              />
            )}
          </>
        ) : null}

        {tab === "members" ? (
          <div className="flex max-w-xl flex-col gap-5">
            <div>
              <h3 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                {t.teamTitle}
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">{t.teamDesc}</p>
            </div>

            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
              <h4 className="mb-2 text-sm font-bold text-on-surface">{t.roomNameLabel}</h4>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={roomNameDraft}
                  onChange={(event) => setRoomNameDraft(event.target.value)}
                  placeholder={t.roomNamePlaceholder}
                  className="field flex-1"
                />
                <button
                  onClick={() => updateRoom(room.id, { name: roomNameDraft.trim() || room.name })}
                  className="btn-gradient rounded-full px-4 py-2 text-sm font-bold text-on-primary"
                >
                  {t.saveName}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
              {room.members.length === 0 ? (
                <p className="p-5 text-sm text-on-surface-variant">{t.noMembersYet}</p>
              ) : null}

              {room.members.map((member, index) => {
                const isExpanded = expandedMemberId === member.id;
                const memberStyle = getMemberStyle(member.colorId);

                return (
                  <div key={member.id} className={index > 0 ? "border-t border-outline-variant/10" : ""}>
                    <div className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-container-low">
                      <div style={memberStyle} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {member.initials[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-on-surface">{member.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{t.eventsRegistered(member.events.length)}</p>
                      </div>

                      <button
                        onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                        className="rounded-lg p-1 text-on-surface-variant opacity-100 transition-opacity hover:bg-surface-container md:opacity-0 md:group-hover:opacity-100"
                        title={t.changeColor}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => removeMember(room.id, member.id)}
                        className="p-1 text-on-surface-variant opacity-100 transition-opacity hover:text-error md:opacity-0 md:group-hover:opacity-100"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="flex flex-wrap gap-2 px-5 pb-4">
                        {MEMBER_COLOR_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              updateMemberColor(room.id, member.id, option.id);
                              setExpandedMemberId(null);
                            }}
                            title={option.label}
                            style={{ backgroundColor: option.bg, color: option.text }}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                              member.colorId === option.id
                                ? "scale-105 ring-2 ring-current ring-offset-1"
                                : "opacity-70 hover:opacity-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setInviteOpen(true)}
              className="btn-gradient flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-on-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              {t.inviteBtn}
            </button>

            <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
              <h4 className="mb-1 text-sm font-bold text-on-surface">{t.heatmapTitle}</h4>
              <p className="mb-3 text-[11px] text-on-surface-variant">{t.heatmapDesc}</p>
              <div className="flex flex-wrap gap-2">
                {HEATMAP_COLOR_OPTIONS.map((option) => {
                  const isActive = room.heatmapColor === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => updateRoom(room.id, { heatmapColor: option.id })}
                      title={option.label}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "scale-105 border-current shadow-sm"
                          : "border-outline-variant/20 opacity-60 hover:border-outline-variant/60 hover:opacity-100"
                      }`}
                      style={{ color: option.hex }}
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: option.hex }} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
              <h4 className="text-sm font-bold text-on-surface">{t.roomSettings}</h4>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-xl border border-error/30 px-4 py-2.5 text-left text-sm font-semibold text-error transition-all hover:bg-error/5"
              >
                {t.deleteRoom}
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-surface-container-lowest p-6 shadow-ambient">
            <h3 className="mb-2 text-center text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              {t.deleteTitle}
            </h3>
            <p className="mb-6 whitespace-pre-line text-center text-sm leading-relaxed text-on-surface-variant">
              {t.deleteDesc(room.name)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-full border border-outline-variant py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                {t.deleteNo}
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 rounded-full bg-error py-2.5 text-sm font-bold text-on-error transition-all active:scale-95"
              >
                {t.deleteYes}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmed ? (
        <div className="mobile-floating-safe fixed right-4 z-[60] flex items-center gap-3 rounded-2xl bg-on-surface px-4 py-3 text-sm font-semibold text-inverse-on-surface shadow-ambient sm:right-6 sm:px-5">
          <span className="text-[#4ade80]">OK</span>
          {confirmed.label}
        </div>
      ) : null}

      {inviteOpen ? <InviteModal roomId={room.id} onClose={() => setInviteOpen(false)} /> : null}
      <RoomPersonalizeModal
        room={room}
        open={showPersonalizeModal}
        onClose={() => setShowPersonalizeModal(false)}
      />
    </>
  );
}
