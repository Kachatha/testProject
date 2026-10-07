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
    if (!name.trim()) {
      setErrorPrompt("กรุณาระบุชื่ออาหาร");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorPrompt("กรุณาระบุราคาอาหารให้ถูกต้อง (มากกว่า 0)");
      return;
    }
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorPrompt("จำนวนจานต้องมีค่าอย่างน้อย 1");
      return;
    }
    if (sharedBy.length === 0) {
      setErrorPrompt("กรุณาเลือกคนที่ร่วมรับประทานเมนูนี้อย่างน้อย 1 คน");
      return;
    }

    setErrorPrompt("");
    if (editingId) {
      updateItem(editingId, name.trim(), priceNum, qtyNum, sharedBy);
      setEditingId(null);
    } else {
      addItem(name.trim(), priceNum, qtyNum, sharedBy);
    }

    setName("");
    setPrice("");
    setQuantity("1"); 
    setSharedBy([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("1"); 
    setSharedBy([]);
    setErrorPrompt("");
  };

  return (
    <div className="w-full">
      <h2 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
        2. {editingId ? "✏️ แก้ไขรายการอาหาร" : "🍔 เพิ่มรายการอาหาร"}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="ชื่ออาหาร"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrorPrompt(""); }}
            className="col-span-2 text-sm p-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-all"
          />
          <input
            type="number"
            min="1"
            placeholder="ราคา/จาน"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setErrorPrompt(""); }}
            className="col-span-1 text-sm p-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-[#ea580c] focus:outline-none transition-all"
          />
          <input
            type="number"
            min="1"
            placeholder="จำนวน"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setErrorPrompt(""); }}
            className="col-span-1 text-sm p-3 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-[#ea580c] focus:outline-none text-center font-bold"
          />
        </div>

        {errorPrompt && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
            ⚠️ {errorPrompt}
          </div>
        )}

        {sharedBy.length > 0 && price && !isNaN(parseFloat(price)) && parseFloat(price) > 0 && (
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl text-center text-sm">
            หาร <span className="font-bold">{sharedBy.length}</span> คน 
            <span className="text-slate-400 mx-2">×</span> 
            ตกคนละ <span className="font-bold text-[#ea580c] text-base">฿{((parseFloat(price) * (parseInt(quantity) || 1)) / sharedBy.length).toFixed(2)}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">เลือกเพื่อนร่วมหารเมนูนี้:</label>
          <div className="flex flex-col gap-2 w-full sharekub-participant-list">
            {persons.map((person) => {
              const isSelected = sharedBy.includes(person.id);
              return (
                // 🌟 ปรับปุ่มเลือกเพื่อนให้เป็นสี่เหลี่ยมมน (Rounded-2xl)
                <button
                  key={person.id}
                  type="button"
                  onClick={() => togglePerson(person.id)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm transition-all select-none cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "#fff7ed" : "rgba(255, 255, 255, 0.7)", 
                    color: isSelected ? "#ea580c" : "#475569", 
                    border: isSelected ? "2px solid #f97316" : "1px solid rgba(226, 232, 240, 0.8)", 
                    fontWeight: isSelected ? "700" : "500",
                    boxShadow: isSelected ? "0 4px 12px rgba(249, 115, 22, 0.08)" : "none"
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleActionClick}
            className="flex-1 text-sm font-bold py-3.5 rounded-2xl transition-all border-none block text-center cursor-pointer bg-[#ea580c] text-white shadow-sm hover:bg-[#c2410c]"
          >
            {editingId ? "💾 บันทึกการแก้ไข" : "+ เพิ่มรายการอาหารลงบิล"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-3.5 bg-slate-200 text-slate-600 rounded-2xl text-sm font-bold border-none cursor-pointer hover:bg-slate-300 transition-all"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-4 mt-4 border-t border-slate-100 relative">
        <label className="block text-xs font-bold text-slate-400 mb-2">รายการอาหารในบิลปัจจุบัน ({items.length})</label>
        
        {lastDeleted && (
          <div className="mb-3 px-4 py-3 bg-slate-800 text-white rounded-2xl text-xs flex justify-between items-center shadow-md border border-slate-700">
            <span>ลบ "{lastDeleted.name}" แล้ว</span>
            <button 
              type="button"
              onClick={() => {
                if (lastDeleted) {
                  addItem(lastDeleted.name, lastDeleted.price, lastDeleted.quantity, lastDeleted.sharedBy);
                  setLastDeleted(null);
                }
              }} 
              className="text-[#f97316] font-bold flex items-center gap-1 hover:text-[#ffedd5] transition-colors border-none bg-transparent cursor-pointer p-0"
            >
              <RotateCcw size={14} /> เลิกทำ
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className={`flex flex-col p-3.5 border rounded-2xl text-xs transition-all ${editingId === item.id ? "bg-orange-50 border-[#ea580c] shadow-sm" : "bg-white/80 border-slate-200"}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                  <span className="text-slate-400 mx-1.5 font-medium">x{item.quantity}</span>
                  <span className="text-[#ea580c] font-black">฿{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(item.id);
                      setName(item.name);
                      setPrice(item.price.toString());
                      setQuantity(item.quantity.toString());
                      setSharedBy(item.sharedBy);
                    }} 
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLastDeleted(item);
                      removeItem(item.id);
                      if (editingId === item.id) handleCancelEdit();
                    }} 
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 w-full">
                {item.sharedBy.map((id) => {
                  const person = persons.find((p) => p.id === id);
                  return (
                    <span key={id} className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-slate-600">
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