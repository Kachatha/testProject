"use client";

import { useState } from "react";
import { Person } from "../types"; // ถ้าไฟล์อยู่ในโฟลเดอร์ components ให้ใช้ "../types" แต่ถ้าอยู่ร่วมกับ types.ts ให้ใช้ "./types"
import { Trash2, Edit2, Plus } from "lucide-react";

interface ParticipantManagerProps {
  persons: Person[];
  setPersons: React.Dispatch<React.SetStateAction<Person[]>>;
  removePerson: (id: string) => void;
}

export default function ParticipantManager({ persons, setPersons, removePerson }: ParticipantManagerProps) {
  const [newFriendName, setNewFriendName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddFriend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = newFriendName.trim();
    
    if (!trimmedName) {
      setErrorMsg("กรุณากรอกชื่อเพื่อนก่อนกดเพิ่ม");
      return;
    }

    let finalName = trimmedName;
    let count = 1;
    while (persons.some(p => p.name.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${trimmedName} (${count})`;
      count++;
    }

    setPersons(prev => [...prev, { id: Date.now().toString(), name: finalName }]);
    setNewFriendName("");
    setErrorMsg("");
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    setPersons(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700 mb-2">1. คนในโต๊ะ</h2>

      <form onSubmit={handleAddFriend} className="flex flex-col gap-1.5 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="พิมพ์ชื่อเพื่อน..."
            value={newFriendName}
            onChange={(e) => { setNewFriendName(e.target.value); setErrorMsg(""); }}
            className="text-sm flex-1 p-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl text-sm font-bold transition-all border-none flex items-center gap-1 cursor-pointer bg-[#ea580c] text-white hover:bg-[#c2410c] shadow-sm"
          >
            <Plus size={16} /> เพิ่มคน
          </button>
        </div>
        {errorMsg && <p className="text-[11px] text-red-500 font-medium">⚠️ {errorMsg}</p>}
      </form>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {persons.map((p) => (
          // 🌟 ปรับกล่องรายชื่อเพื่อนให้เป็นสี่เหลี่ยมมน (Rounded-2xl)
          <div key={p.id} className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-2xl text-sm shadow-sm transition-all hover:bg-white">
            {editingId === p.id ? (
              <div className="flex gap-2 w-full items-center">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 py-1.5 px-3 border border-slate-200 rounded-xl text-sm focus:border-[#ea580c] focus:outline-none m-0"
                  autoFocus
                />
                <button type="button" onClick={() => handleSaveEdit(p.id)} className="px-3 py-1.5 rounded-xl font-bold text-xs bg-[#ea580c] text-white border-none cursor-pointer">บันทึก</button>
                <button type="button" onClick={() => setEditingId(null)} className="px-2.5 py-1.5 rounded-xl font-medium text-xs bg-slate-100 text-slate-600 border-none cursor-pointer">ยกเลิก</button>
              </div>
            ) : (
              <>
                <span className="font-bold text-slate-700 ml-1">👤 {p.name}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setEditingId(p.id); setEditingName(p.name); }} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all border-none bg-transparent cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  {p.id !== '1' && (
                    <button type="button" onClick={() => removePerson(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-all border-none bg-transparent cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}