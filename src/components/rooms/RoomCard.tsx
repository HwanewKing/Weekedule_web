"use client";

import { Room, STATUS_CONFIG, COLOR_CONFIG, getMemberStyle } from "@/types/room";
import RoomIconEl from "./RoomIcon";
import Link from "next/link";

interface RoomCardProps {
  room: Room;
  featured?: boolean; // wide card
}

export default function RoomCard({ room, featured = false }: RoomCardProps) {
  const status  = STATUS_CONFIG[room.status];
  const colors  = COLOR_CONFIG[room.color];
  const extra   = room.members.length > 3 ? room.members.length - 3 : 0;
  const visible = room.members.slice(0, 3);

  return (
    <Link
      href={`/rooms/${room.id}`}
      className={`group relative bg-surface-container-lowest rounded-3xl p-7 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-ambient ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {/* Left accent pill */}
      <div className={`absolute left-0 top-10 w-[3px] h-10 rounded-r-full ${colors.accent}`} />

      <div className={featured ? "flex flex-col md:flex-row gap-8" : "flex flex-col h-full"}>
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div className={`p-3 rounded-2xl ${colors.iconBg} ${colors.iconText}`}>
              <RoomIconEl icon={room.icon} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>

          {/* Info */}
          <h4
            className="text-base font-bold text-on-surface mb-1.5 leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {room.name}
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{room.description}</p>

          {/* Bottom */}
          <div className="flex items-center justify-between mt-6">
            {/* Avatars */}
            <div className="flex -space-x-2">
              {visible.map((m) => (
                <div
                  key={m.id}
                  style={getMemberStyle(m.colorId)}
                  className="w-8 h-8 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold"
                  title={m.name}
                >
                  {m.initials[0]}
                </div>
              ))}
              {extra > 0 && (
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                  +{extra}
                </div>
              )}
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${colors.iconBg} group-hover:${colors.accent}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={colors.iconText}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Next sync panel (featured only) */}
        {featured && room.nextSync && (
          <div className="w-full md:w-56 flex flex-col justify-end gap-3">
            <div className="bg-surface-container-low rounded-2xl p-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                Next Sync
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold text-on-surface">
                  {room.nextSyncDay}, {room.nextSync}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              Join Room
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
