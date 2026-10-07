"use client";

import React, { useState, useMemo } from "react";
// *หมายเหตุ: ปรับ Path การ import ให้ตรงกับโฟลเดอร์ของคุณ เช่น './components/ParticipantManager'
import ParticipantManager from "../components/ParticipantManager";
import FoodItem from "../components/FoodItem";
import Summary from "../components/Summary";
import BillSetup from "../components/BillSetup";
import BillHistory from "../components/History";
import { Person, FoodItem as FoodItemType, BillConfig, BillHistoryItem } from "../types";
import { calculateBill } from "../utils/calculator";
import { Menu, X } from "lucide-react"; 

export default function ShareKubApp() {
  // เมนูเหลือแค่ 2 หน้า (ดึงหน้า Settings ออกไปซ่อนไว้ในหน้าหลักแทน)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [history, setHistory] = useState<BillHistoryItem[]>([]);

  // 🌟 State สำหรับซ่อน/แสดง ตั้งค่าขั้นสูง และ วิธีคำนวณ
  const [showSettings, setShowSettings] = useState(false);
  const [showMath, setShowMath] = useState(false);

  const [persons, setPersons] = useState<Person[]>([
    { id: "1", name: "คุณ" },
    { id: "2", name: "เพื่อน 1" },
  ]);
  const [items, setItems] = useState<FoodItemType[]>([]);
  const [config, setConfig] = useState<BillConfig>({
    promptPay: "",
    vat: 0,
    serviceCharge: 0,
    rounding: "none"
  });

  const removePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    setItems(prev => prev.map(item => ({ ...item, sharedBy: item.sharedBy.filter(pId => pId !== id) })));
  };

  const addItem = (name: string, price: number, quantity: number, sharedBy: string[]) => {
    const newItem: FoodItemType = { id: Date.now().toString(), name, price, quantity, sharedBy };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, name: string, price: number, quantity: number, sharedBy: string[]) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, name, price, quantity, sharedBy } : item));
  };

  const removeHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const summaries = useMemo(() => calculateBill(persons, items, config), [persons, items, config]);
  
  // คำนวณยอดสำหรับโชว์ในแผง "ดูลำดับการคำนวณ"
  const totalFoodPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const serviceChargeAmount = totalFoodPrice * (config.serviceCharge / 100);
  const totalWithSc = totalFoodPrice + serviceChargeAmount;
  const vatAmount = totalWithSc * (config.vat / 100);
  const grandTotalBeforeRounding = totalWithSc + vatAmount;
  
  const grandTotal = summaries.reduce((sum, s) => sum + s.finalAmount, 0);
  const roundingDiff = grandTotal - grandTotalBeforeRounding;

  const handleSaveBill = () => {
    if (items.length === 0) return;
    const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    const newHistory: BillHistoryItem = {
      id: Date.now().toString(),
      date: dateStr,
      title: `บิลวันที่ ${dateStr} (${persons.length} คน)`,
      grandTotal,
      summaries
    };
    setHistory(prev => [newHistory, ...prev]);
    alert("บันทึกบิลลงประวัติเรียบร้อยแล้ว!");
    setActiveTab('history');
  };

  return (
    <div className="w-full max-w-[1024px] mx-auto p-4 md:p-6 flex flex-col gap-4 min-h-screen">
      
      {/* Header + Hamburger Menu */}
      <header className="relative flex justify-between items-start mb-2 z-[100]">
        <div>
          <h1 className="sharekub-title text-2xl font-bold text-[#1e3a8a] text-left mb-1">SHAREKUB</h1>
          <p className="sharekub-subtitle mt-0 text-left text-xs">หารบิลให้จบในไม่กี่ขั้นตอน</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="cursor-pointer hover:bg-slate-100 rounded-lg p-2 transition-colors"
            style={{ border: 'none', background: 'transparent' }} 
          >
            {isMenuOpen ? <X size={26} color="#ea580c" /> : <Menu size={26} color="#ea580c" />}
          </button>

          {isMenuOpen && (
            <div className="sharekub-dropdown absolute top-full right-0 mt-2 w-max min-w-[160px] overflow-hidden flex flex-col z-[150]">
              <button onClick={() => { setActiveTab('current'); setIsMenuOpen(false); }} className={`px-4 py-3.5 text-sm font-bold text-left cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'current' ? 'tab-active' : ''}`}>
                📝 บิลปัจจุบัน
              </button>
              <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className={`px-4 py-3.5 text-sm font-bold text-left cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'tab-active' : ''}`}>
                📜 ประวัติบิล {history.length > 0 && `(${history.length})`}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- เนื้อหา: บิลปัจจุบัน (แยก 2 คอลัมน์) --- */}
      {activeTab === 'current' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          
          {/* คอลัมน์ซ้าย: ฟอร์มกรอกข้อมูล */}
          <div className="w-full lg:w-7/12 flex flex-col gap-4">
            <div className="sharekub-card-wrapper">
              <ParticipantManager persons={persons} setPersons={setPersons} removePerson={removePerson} />
            </div>
            <div className="sharekub-card-wrapper">
              <FoodItem persons={persons} items={items} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />
            </div>

            {/* 🌟 ข้อ 2: แยกข้อมูลหลัก กับ ตั้งค่าขั้นสูง ออกจากกันแบบชัดเจน */}
            <div className="sharekub-card-wrapper border-slate-200">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex justify-between items-center text-sm font-bold text-slate-600 bg-transparent border-none cursor-pointer p-1"
              >
                <span className="flex items-center gap-2">
                  ⚙️ ตั้งค่าบิลเพิ่มเติม <span className="text-xs font-normal text-slate-400 hidden sm:inline">(VAT, Service Charge, พร้อมเพย์)</span>
                </span>
                <span className="text-[#ea580c] transition-transform duration-200" style={{ transform: showSettings ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>
              
              {showSettings && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <BillSetup config={config} setConfig={setConfig} />
                </div>
              )}
            </div>
          </div>

          {/* คอลัมน์ขวา: พระเอกของหน้า (Live Summary) ล็อกติดหน้าจอเวลาไถลง */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4 lg:sticky lg:top-6">
            
            <div className="sharekub-card-wrapper shadow-lg" style={{ borderColor: '#ea580c', borderWidth: '2px' }}>
              <h2 className="text-lg font-bold text-[#ea580c] mb-4 border-b pb-2 border-slate-100">🧾 สรุปบิล (Live)</h2>
              
              <div className="space-y-2 mb-4">
                {persons.map(p => {
                  const personSummary = summaries.find(s => s.person.id === p.id);
                  const amount = personSummary ? personSummary.finalAmount : 0;
                  return (
                    <div key={p.id} className="flex justify-between text-sm font-medium text-slate-700">
                      <span>👤 {p.name}</span>
                      <span className={amount > 0 ? "text-[#ea580c] font-bold" : "text-slate-400"}>฿{amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* 🌟 ข้อ 1: ปุ่มเปิดดู "ลำดับการคำนวณ" (Transparency Formula) */}
              <div className="border-t border-slate-100 pt-3">
                <button 
                  onClick={() => setShowMath(!showMath)} 
                  className="text-[11px] text-[#ea580c] font-bold flex items-center justify-center gap-1 w-full bg-orange-50/50 hover:bg-orange-50 py-2 rounded-lg border-none cursor-pointer transition-colors"
                >
                  🔍 ดูลำดับการคำนวณ {showMath ? "▲" : "▼"}
                </button>

                {showMath && (
                  <div className="mt-2 bg-slate-50 border border-slate-100 p-3 rounded-lg text-[11px] text-slate-600 space-y-2 font-mono shadow-inner">
                    <div className="flex justify-between">
                      <span>1. ค่าอาหารรวม</span> <span>฿{totalFoodPrice.toFixed(2)}</span>
                    </div>
                    {config.serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span>2. Service Charge ({config.serviceCharge}%)</span> <span>฿{serviceChargeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {config.vat > 0 && (
                      <div className="flex justify-between">
                        <span>3. VAT ({config.vat}%) <span className="text-[9px] text-slate-400">คิดจากยอด (1+2)</span></span> 
                        <span>฿{vatAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-700 border-t border-slate-200 pt-1.5 mt-1.5">
                      <span>ยอดรวมก่อนปัดเศษ</span> <span>฿{grandTotalBeforeRounding.toFixed(2)}</span>
                    </div>
                    {roundingDiff !== 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>4. ส่วนต่างปัดเศษ</span> 
                        <span>{roundingDiff > 0 ? '+' : ''}฿{roundingDiff.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ยอดรวมทั้งหมด */}
              <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-end">
                <span className="font-bold text-slate-700">ยอดชำระสุทธิ</span>
                <span className="text-3xl font-black text-[#ea580c]">฿{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="sharekub-card-wrapper">
                <Summary summaries={summaries} promptPay={config.promptPay} />
                <button 
                  onClick={handleSaveBill}
                  className="w-full mt-4 py-3 bg-[#1e293b] text-white rounded-xl text-sm font-bold hover:bg-[#0f172a] transition-all border-none cursor-pointer shadow-sm"
                >
                  บันทึกบิลนี้ลงประวัติ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- เนื้อหา: ประวัติบิล --- */}
      {activeTab === 'history' && (
        <div className="w-full flex justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-4xl"> {/* ขยายความกว้างเป็น max-w-4xl */}
            <div className="sharekub-card-wrapper">
              {history.length > 0 ? (
                <BillHistory history={history} onRemoveHistory={removeHistory} />
              ) : (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center">
                  <span className="text-6xl block mb-4 opacity-50">📭</span>
                  <p className="text-base font-bold text-slate-500">ยังไม่มีประวัติการหารบิล</p>
                  <p className="text-xs mt-1">บิลที่คุณบันทึกจะมาแสดงอยู่ที่นี่</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}