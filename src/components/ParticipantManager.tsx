"use client";

import { useState } from "react";
import { Person } from "../types";
import { Trash2, Edit2 } from "lucide-react";

interface ParticipantManagerProps {
  persons: Person[];
  setPersons: React.Dispatch<React.SetStateAction<Person[]>>;
  removePerson: (id: string) => void;
}

export default function ParticipantManager({ persons, setPersons, removePerson }: ParticipantManagerProps) {
  const [guestCount, setGuestCount] = useState("3");
  const [newFriendName, setNewFriendName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleGenerateGuests = () => {
    const count = parseInt(guestCount) || 3;
    const newGuests: Person[] = [];
    for (let i = 1; i <= count; i++) {
      newGuests.push({
        id: `g-${Date.now()}-${i}`,
        name: i === 1 ? "ฉันเอง" : `เพื่อนคนที่ ${i}`
      });
    }
    setPersons(newGuests);
  };

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    setPersons(prev => [...prev, { id: Date.now().toString(), name: newFriendName.trim() }]);
    setNewFriendName("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    setPersons(prev => prev.map(p => p.id === id ? { ...p, name: editingName.trim() } : p));
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700 mb-2">1. จัดการรายชื่อเพื่อนร่วมโต๊ะ</h2>

      {/* จัดการลำดับความเหลื่อมล้ำ: สเต็ปกรอกจำนวนดิ่งลงเป็นระเบียบแบบภาพที่ 2 เคลียร์จุดเบี้ยว */}
      <div className="space-y-2.5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">จำนวนคนทั้งหมด (รวมคุณ):</label>
          <input
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="w-full mb-2"
            placeholder="3"
          />
          <button
            type="button"
            onClick={handleGenerateGuests}
            className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-all text-center block"
          >
            กำหนดชื่อเพื่อนและสุ่มรายชื่อเริ่มต้น
          </button>
        </div>

        <div className="border-t border-slate-100 my-2 pt-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">เพิ่มชื่อเพื่อนรายคนเพิ่มเติม:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="พิมพ์ชื่อเพื่อน..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="text-xs flex-1"
            />
            <button
              type="button"
              onClick={handleAddFriend}
              className="px-4 py-2 bg-[#ea580c] text-white rounded-xl text-xs font-bold hover:bg-[#c2410c] transition-all border-none"
            >
              + เพิ่มชื่อ
            </button>
          </div>
        </div>
      </div>

      {/* รายชื่อเพื่อนในกลุ่ม ด้านล่าง */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
        {persons.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-xl text-xs shadow-sm">
            {editingId === p.id ? (
              <div className="flex gap-1.5 w-full items-center mr-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="py-1 px-2 border rounded-md text-xs w-full focus:border-slate-400 focus:outline-none"
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(p.id)} className="bg-green-600 text-white px-2 py-1 rounded-md font-bold text-[10px] border-none">บันทึก</button>
                <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 px-2 py-1 rounded-md text-[10px] border-none">ยกเลิก</button>
              </div>
            ) : (
              <>
                <span className="font-bold text-slate-700 ml-1">{p.name}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setEditingId(p.id); setEditingName(p.name); }} className="p-1 text-slate-400 hover:text-indigo-600 transition-all border-none bg-transparent">
                    <Edit2 size={12} />
                  </button>
                  <button type="button" onClick={() => removePerson(p.id)} className="p-1 text-slate-400 hover:text-red-500 transition-all border-none bg-transparent">
                    <Trash2 size={12} />
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
