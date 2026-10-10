"use client";

import { useState } from "react";
import { Person, FoodItem as FoodItemType } from "../types";
import { Trash2, Edit2, Plus } from "lucide-react";

interface ParticipantManagerProps {
  persons: Person[];
  setPersons: React.Dispatch<React.SetStateAction<Person[]>>;
  removePerson: (id: string) => void;
  items: FoodItemType[];
}

export default function ParticipantManager({ persons, setPersons, removePerson, items }: ParticipantManagerProps) {
  const [newFriendName, setNewFriendName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddFriend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newFriendName.trim();
    if (!trimmed) return;

    let finalName = trimmed;
    let count = 1;
    while (persons.some(p => p.name.toLowerCase() === finalName.toLowerCase())) {
      finalName = `${trimmed} (${count})`; count++;
    }

    setPersons(prev => [...prev, { id: Date.now().toString(), name: finalName }]);
    setNewFriendName("");
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setPersons(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    setEditingId(null);
  };

  const handleDelete = (p: Person) => {
    const usedInItems = items.filter(i => i.sharedBy.includes(p.id));
    if (usedInItems.length > 0) {
      if (!window.confirm(`${p.name} มีรายการอาหารที่ถูกแบ่งอยู่ ${usedInItems.length} รายการ\nต้องการลบ ${p.name} หรือไม่?`)) {
        return;
      }
    }
    removePerson(p.id);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-extrabold text-white mb-2">1. สมาชิกร่วมหาร</h2>

      <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="พิมพ์ชื่อเพื่อน..."
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          className="cyber-input flex-1"
        />
        <button type="submit" className="px-5 py-3 rounded-2xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all border-none cursor-pointer flex items-center gap-1.5">
          <Plus size={16} /> เพิ่มคน
        </button>
      </form>

      <div className="space-y-2">
        {persons.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-sm">
            {editingId === p.id ? (
              <div className="flex gap-2 w-full">
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus className="cyber-input flex-1 py-1 px-3 text-xs" />
                <button onClick={() => handleSaveEdit(p.id)} className="px-3 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold border-none cursor-pointer">บันทึก</button>
                <button onClick={() => setEditingId(null)} className="px-3 bg-slate-800 text-slate-400 rounded-xl text-xs border-none cursor-pointer">ยกเลิก</button>
              </div>
            ) : (
              <>
                <span className="font-bold text-slate-200 ml-1">👤 {p.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(p.id); setEditingName(p.name); }} className="p-1.5 text-slate-400 hover:text-emerald-400 bg-transparent border-none cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-transparent border-none cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}