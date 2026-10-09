"use client";

import { useState, useEffect } from "react";
import { Person, FoodItem as FoodItemType } from "../types";
import { Trash2, Edit2, RotateCcw } from "lucide-react";

interface FoodItemProps {
  persons: Person[];
  items: FoodItemType[];
  addItem: (name: string, price: number, quantity: number, sharedBy: string[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, name: string, price: number, quantity: number, sharedBy: string[]) => void;
}

export default function FoodItem({ persons, items, addItem, removeItem, updateItem }: FoodItemProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1"); 
  const [sharedBy, setSharedBy] = useState<string[]>([]);
  const [errorPrompt, setErrorPrompt] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<FoodItemType | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lastDeleted) {
      timer = setTimeout(() => setLastDeleted(null), 5000);
    }
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  const togglePerson = (personId: string) => {
    setErrorPrompt("");
    setSharedBy((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
    );
  };

  const handleActionClick = () => {
    if (!name.trim()) return setErrorPrompt("กรุณาระบุชื่ออาหาร");
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return setErrorPrompt("ราคาต้องมากกว่า 0 บาท");
    
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 1) return setErrorPrompt("จำนวนต้องอย่างน้อย 1 จาน");
    
    if (sharedBy.length === 0) return setErrorPrompt("กรุณาเลือกคนที่ร่วมกินเมนูนี้อย่างน้อย 1 คน");

    setErrorPrompt("");
    if (editingId) {
      updateItem(editingId, name.trim(), priceNum, qtyNum, sharedBy);
      setEditingId(null);
    } else {
      addItem(name.trim(), priceNum, qtyNum, sharedBy);
    }

    setName(""); setPrice(""); setQuantity("1"); setSharedBy([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null); setName(""); setPrice(""); setQuantity("1"); setSharedBy([]); setErrorPrompt("");
  };

  return (
    <div className="w-full">
      <h2 className="text-sm font-extrabold text-white mb-4 border-b border-slate-800 pb-2">
        2. {editingId ? "✏️ แก้ไขรายการอาหาร" : "🍔 เพิ่มรายการอาหาร"}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="ชื่ออาหาร"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrorPrompt(""); }}
            className="col-span-2 sm:col-span-2"
          />
          <input
            type="number"
            min="1"
            placeholder="ราคา/จาน"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setErrorPrompt(""); }}
            className="col-span-1"
          />
          <input
            type="number"
            min="1"
            placeholder="จำนวน"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrorPrompt(""); }}
            className="col-span-1 text-center font-bold"
          />
        </div>

        {errorPrompt && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-semibold">
            ⚠️ {errorPrompt}
          </div>
        )}

        {sharedBy.length > 0 && price && !isNaN(parseFloat(price)) && parseFloat(price) > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center text-xs text-slate-300">
            หาร <span className="font-bold text-white">{sharedBy.length}</span> คน 
            <span className="text-slate-500 mx-2">×</span> 
            ตกคนละ <span className="font-bold text-emerald-400 text-sm font-mono">฿{((parseFloat(price) * (parseInt(quantity) || 1)) / sharedBy.length).toFixed(2)}</span>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400">
              ใครกินเมนูนี้บ้าง?
            </label>
            <button
              type="button"
              onClick={() => sharedBy.length === persons.length ? setSharedBy([]) : setSharedBy(persons.map(p => p.id))}
              className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border-none cursor-pointer"
            >
              {sharedBy.length === persons.length ? "ยกเลิกทั้งหมด" : "☑ เลือกทุกคน"}
            </button>
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            {persons.map((person) => {
              const isSelected = sharedBy.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => togglePerson(person.id)}
                  className={`participant-chip ${isSelected ? 'active' : ''}`}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1.5">👤 {person.name}</span>
                    {isSelected && <span className="text-emerald-400 font-bold">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleActionClick}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all border-none cursor-pointer"
          >
            {editingId ? "💾 บันทึกการแก้ไข" : "+ เพิ่มรายการอาหารลงบิล"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-3.5 bg-slate-800 text-slate-400 rounded-2xl text-xs font-bold border-none cursor-pointer hover:bg-slate-700 hover:text-white transition-all"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-4 mt-6 border-t border-slate-800">
        <label className="block text-xs font-bold text-slate-500 mb-2">รายการอาหารในบิลปัจจุบัน ({items.length})</label>
        
        {lastDeleted && (
          <div className="mb-3 px-4 py-3 bg-slate-800 text-white rounded-2xl text-xs flex justify-between items-center border border-slate-700">
            <span>ลบ "{lastDeleted.name}" แล้ว</span>
            <button type="button" onClick={() => { if (lastDeleted) { addItem(lastDeleted.name, lastDeleted.price, lastDeleted.quantity, lastDeleted.sharedBy); setLastDeleted(null); } }} className="text-emerald-400 font-bold flex items-center gap-1 hover:underline border-none bg-transparent cursor-pointer p-0">
              <RotateCcw size={14} /> เลิกทำ
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className={`flex flex-col p-3.5 border rounded-2xl text-xs transition-all ${editingId === item.id ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-950/60 border-slate-800"}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-slate-200 text-sm">{item.name}</span>
                  <span className="text-slate-500 mx-1.5 font-medium">x{item.quantity}</span>
                  <span className="text-emerald-400 font-black font-mono">฿{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => { setEditingId(item.id); setName(item.name); setPrice(item.price.toString()); setQuantity(item.quantity.toString()); setSharedBy(item.sharedBy); }} className="p-1.5 text-slate-400 hover:text-emerald-400 transition-all bg-transparent border-none cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button type="button" onClick={() => { setLastDeleted(item); removeItem(item.id); if (editingId === item.id) handleCancelEdit(); }} className="p-1.5 text-slate-400 hover:text-rose-400 transition-all bg-transparent border-none cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 w-full">
                {item.sharedBy.map((id) => {
                  const person = persons.find((p) => p.id === id);
                  return (
                    <span key={id} className="bg-slate-800 border border-slate-700/60 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                      👤 {person ? person.name : "ไม่ทราบชื่อ"}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}