"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-xs text-slate-500 font-medium">กำลังโหลด...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
        {session.user.image ? (
          <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full border border-emerald-500/40" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User size={13} />
          </div>
        )}
        <span className="text-xs font-bold text-slate-200 max-w-[90px] truncate">
          {session.user.name ?? "ผู้ใช้งาน"}
        </span>
        <button
          onClick={() => signOut()}
          className="p-1 text-slate-400 hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer flex items-center"
          title="ออกจากระบบ"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 rounded-full text-xs font-black shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all border-none cursor-pointer"
    >
      <LogIn size={14} /> เข้าสู่ระบบ
    </button>
  );
}