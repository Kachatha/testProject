"use client";

import { useState } from "react";
import { Person, FoodItem as FoodItemType } from "../types";
import { Trash2 } from "lucide-react";

interface FoodItemProps {
  persons: Person[];
  items: FoodItemType[];
  addItem: (name: string, price: number, quantity: number, sharedBy: string[]) => void;
  removeItem: (id: string) => void;
}

export default function FoodItem({ persons, items, addItem, removeItem }: FoodItemProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1"); 
  const [sharedBy, setSharedBy] = useState<string[]>([]);

  const togglePerson = (personId: string) => {
    setSharedBy((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const handleAddClick = () => {
    if (!name.trim() || !price || sharedBy.length === 0) return;
    const qtyNum = parseInt(quantity) || 1;
    addItem(name.trim(), parseFloat(price), qtyNum, sharedBy);
    setName("");
    setPrice("");
    setQuantity("1"); 
    setSharedBy([]);
  };

  return (
    <div className="w-full" style={{ contentVisibility: "auto" }}>
      <h2 className="text-sm font-bold text-slate-700 mb-4">2. เพิ่มรายการอาหาร</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="ชื่ออาหาร"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-2 text-sm p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
          />
          <input
            type="number"
            placeholder="ราคา"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-1 text-sm p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
          />
          <input
            type="number"
            min="1"
            placeholder="จำนวน"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="col-span-1 text-sm p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-center font-bold"
          />
        </div>

        {/* ปุ่มรายชื่อเพื่อน: แกะ inline style พื้นหลังทึบเก่าออกทั้งหมด เพื่อเรียกสไตล์สีที่คุณชอบเข้ามาแสดงผล */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">เลือกเพื่อนร่วมหารเมนูนี้:</label>
          <div className="flex flex-col gap-2 w-full sharekub-participant-list">
            {persons.map((person) => {
              const isSelected = sharedBy.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => togglePerson(person.id)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all select-none cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "#fff7ed" : "#ffffff", 
                    color: isSelected ? "#ea580c" : "#475569", 
                    border: isSelected ? "2px solid #f97316" : "1px solid rgba(249, 115, 22, 0.25)", 
                    fontWeight: isSelected ? "700" : "500",
                    boxShadow: isSelected ? "0 4px 10px rgba(249, 115, 22, 0.05)" : "none"
                  }}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5">👤 {person.name}</span>
                    {isSelected && <span className="text-[#f97316] font-bold">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ปุ่มกดยืนยันเพิ่มเมนูอาหาร */}
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!name.trim() || !price || sharedBy.length === 0}
          className={`w-full text-sm font-bold py-3.5 rounded-xl transition-all border-none block text-center cursor-pointer ${
            (!name.trim() || !price || sharedBy.length === 0)
              ? "bg-slate-100 text-slate-400 opacity-40 pointer-events-none"
              : "bg-[#ea580c] text-white shadow-sm hover:bg-[#c2410c]"
          }`}
        >
          เพิ่มรายการอาหารลงบิล
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 pt-4 mt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-400">รายการอาหารในบิลปัจจุบัน ({items.length})</label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-slate-700">
                    {item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span> <span className="text-[#ea580c] font-extrabold ml-1">฿{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 w-full">
                    {item.sharedBy.map((id) => {
                      const person = persons.find((p) => p.id === id);
                      return (
                        <span 
                          key={id} 
                          className="bg-white border rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm"
                          style={{ borderColor: "rgba(249, 115, 22, 0.4)" }} /* ดึงสไตล์เส้นขอบสีส้มบางๆ มาล้อมรอบชื่อเพื่อน */
                        >
                          👤 {person ? person.name : "ไม่ทราบชื่อ"}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)} 
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-all bg-transparent border-none cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
