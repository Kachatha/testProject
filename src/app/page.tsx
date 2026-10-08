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
import { Menu, X, Settings, ChevronDown, ChevronRight, Receipt, RotateCcw, Copy } from "lucide-react";

export default function ShareKubApp() {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [history, setHistory] = useState<BillHistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const [billName, setBillName] = useState("");
  const [persons, setPersons] = useState<Person[]>([{ id: "1", name: "คุณ" }, { id: "2", name: "เพื่อน 1" }]);
  const [items, setItems] = useState<FoodItemType[]>([]);
  const [config, setConfig] = useState<BillConfig>({ promptPay: "", vat: 0, serviceCharge: 0, rounding: "none" });

  const removePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    setItems(prev => prev.map(item => ({ ...item, sharedBy: item.sharedBy.filter(pId => pId !== id) })));
  };
  const addItem = (name: string, price: number, quantity: number, sharedBy: string[]) => setItems(prev => [...prev, { id: Date.now().toString(), name, price, quantity, sharedBy }]);
  const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));
  const updateItem = (id: string, name: string, price: number, quantity: number, sharedBy: string[]) => setItems(prev => prev.map(item => item.id === id ? { ...item, name, price, quantity, sharedBy } : item));
  
  // 🌟 Confirmation ป้องกันการกดลบประวัติโดยไม่ได้ตั้งใจ
  const removeHistory = (id: string) => {
    if (window.confirm("ลบประวัติบิลนี้หรือไม่?\nการลบไม่สามารถย้อนกลับได้")) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  const summaries = useMemo(() => calculateBill(persons, items, config), [persons, items, config]);
  
  const totalFoodPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const serviceChargeAmount = totalFoodPrice * (config.serviceCharge / 100);
  const totalWithSc = totalFoodPrice + serviceChargeAmount;
  const vatAmount = totalWithSc * (config.vat / 100);
  const grandTotalBeforeRounding = totalWithSc + vatAmount;
  const grandTotal = summaries.reduce((sum, s) => sum + s.finalAmount, 0);
  const roundingDiff = grandTotal - grandTotalBeforeRounding;

  // 🌟 ระบบเริ่มบิลใหม่พร้อมแจ้งเตือน
  const handleNewBill = () => {
    if (items.length > 0) {
      if (!window.confirm(`ล้างบิลนี้?\nข้อมูลอาหาร ${items.length} รายการจะถูกลบจากบิลปัจจุบัน (กรุณาบันทึกประวัติก่อนเริ่มใหม่)`)) return;
    }
    setItems([]);
    setPersons([{ id: "1", name: "คุณ" }, { id: "2", name: "เพื่อน 1" }]);
    setBillName("");
    setActiveTab('current');
  };

  const handleSaveBill = () => {
    if (items.length === 0) return;
    const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    const finalBillName = billName.trim() || `บิลวันที่ ${dateStr}`;
    const newHistory: BillHistoryItem = { id: Date.now().toString(), date: dateStr, title: `${finalBillName} (${persons.length} คน)`, grandTotal, summaries };
    setHistory(prev => [newHistory, ...prev]);
    alert("💾 บันทึกบิลลงในอุปกรณ์นี้เรียบร้อยแล้ว!");
    setActiveTab('history');
  };

  // 🌟 ฟีเจอร์ Copy to Clipboard สร้างข้อความสรุปพร้อมส่งในแชต
  const handleCopySummary = () => {
    let text = `🍜 สรุปค่าอาหาร: ${billName.trim() || 'บิลปัจจุบัน'}\n\n`;
    summaries.forEach(s => {
      if (s.finalAmount > 0) {
        text += `${s.person.name.padEnd(12, ' ')} ฿${s.finalAmount.toFixed(2)}\n`;
      }
    });
    text += `\nรวมยอดสุทธิ     ฿${grandTotal.toFixed(2)}`;
    if (config.promptPay) {
      text += `\n\n💳 พร้อมเพย์: ${config.promptPay}`;
    }
    navigator.clipboard.writeText(text);
    alert("📋 คัดลอกข้อความสรุปยอดเรียบร้อยแล้ว นำไปวางในแชตได้เลย!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-4 min-h-screen">
      
      <header className="relative flex justify-between items-center mb-6 z-[100] bg-white/60 backdrop-blur-md p-5 rounded-[32px] shadow-sm border border-white">
        <div>
          {/* 🌟 Brand Hierarchy ที่ชัดเจนขึ้น */}
          <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight mb-0.5">SHAREKUB</h1>
          <p className="text-sm font-medium text-slate-500">หารบิลง่าย ๆ กับเพื่อน</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-semibold">
             <span>สร้างบิล</span> <span className="text-orange-300">→</span>
             <span>แบ่งค่า</span> <span className="text-orange-300">→</span>
             <span>แชร์ยอด</span> <span className="text-orange-300">→</span>
             <span>จ่าย</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleNewBill} className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700">
            <RotateCcw size={14} /> <span className="hidden sm:inline">ล้างบิล</span>
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-[#ea580c]">
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col z-[150] border border-slate-100">
              <button onClick={() => { setActiveTab('current'); setIsMenuOpen(false); }} className={`px-5 py-4 text-sm font-bold text-left transition-all ${activeTab === 'current' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-slate-600'}`}>📝 บิลปัจจุบัน</button>
              <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className={`px-5 py-4 text-sm font-bold text-left transition-all ${activeTab === 'history' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-slate-600'}`}>📜 ประวัติบิล {history.length > 0 && `(${history.length})`}</button>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'current' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="sharekub-card-wrapper !py-4 mb-4">
              <input type="text" placeholder="ชื่อร้าน / ชื่อบิล (เช่น หมูกระทะวันเสาร์)" value={billName} onChange={e => setBillName(e.target.value)} className="w-full text-lg font-bold text-center border-none shadow-none bg-transparent" />
            </div>

            <div className="sharekub-card-wrapper">
              <ParticipantManager persons={persons} setPersons={setPersons} removePerson={removePerson} items={items} />
            </div>
            
            <div className="sharekub-card-wrapper">
              <FoodItem persons={persons} items={items} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />
            </div>

            <div className="sharekub-card-wrapper p-4">
              <button onClick={() => setShowSettings(!showSettings)} className="w-full flex justify-between items-center text-sm font-bold text-slate-700 bg-transparent border-none cursor-pointer">
                <span className="flex items-center gap-2"><Settings size={18} /> ตั้งค่า VAT & Service Charge</span>
                {showSettings ? <ChevronDown size={18} className="text-[#ea580c]" /> : <ChevronRight size={18} className="text-slate-400" />}
              </button>
              {showSettings && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <BillSetup config={config} setConfig={setConfig} />
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-5/12 flex flex-col lg:sticky lg:top-6">
            <div className="sharekub-card-wrapper highlight-card relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-lg font-bold text-[#ea580c] flex items-center gap-2"><Receipt size={20} /> สรุปบิล</h2>
                   {/* 🌟 สถานะบิล (Readiness Status) */}
                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${items.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                     {items.length > 0 ? `✓ พร้อมคำนวณ (${items.length} รายการ)` : 'รอการเพิ่มเมนู'}
                   </span>
                </div>
                
                {items.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-orange-100 rounded-2xl bg-white/50">
                    ยังไม่มีรายการอาหาร<br/>เพิ่มเมนูแรกเพื่อเริ่มคำนวณ
                  </div>
                ) : (
                  <>
                    {/* 🌟 โครงสร้าง Summary แบบโปร่งใส (ตามที่ออกแบบมาเป๊ะ) */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-b border-orange-100/60 pb-4">
                      <div className="flex justify-between"><span>ค่าอาหาร</span> <span>฿{totalFoodPrice.toFixed(2)}</span></div>
                      {config.serviceCharge > 0 && <div className="flex justify-between"><span>Service Charge</span> <span>฿{serviceChargeAmount.toFixed(2)}</span></div>}
                      {config.vat > 0 && <div className="flex justify-between"><span>VAT</span> <span>฿{vatAmount.toFixed(2)}</span></div>}
                      <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 mt-2"><span>ก่อนปัด</span> <span>฿{grandTotalBeforeRounding.toFixed(2)}</span></div>
                      {roundingDiff !== 0 && <div className="flex justify-between text-amber-600"><span>Rounding</span> <span>{roundingDiff > 0 ? '+' : ''}฿{roundingDiff.toFixed(2)}</span></div>}
                    </div>

                    <div className="space-y-3 mb-4">
                      {persons.map(p => {
                        const personSummary = summaries.find(s => s.person.id === p.id);
                        const amount = personSummary ? personSummary.finalAmount : 0;
                        if (amount === 0) return null;
                        return (
                          <div key={p.id} className="flex justify-between items-center text-sm font-medium text-slate-700 bg-white/60 p-2.5 rounded-xl border border-white">
                            <span>👤 {p.name}</span>
                            <span className="text-[#ea580c] font-bold text-base">฿{amount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-orange-200/60 mt-4 pt-4 flex justify-between items-end mb-4">
                      <span className="font-bold text-slate-700">ยอดชำระสุทธิ</span>
                      <span className="text-3xl font-black text-[#ea580c] tracking-tight">฿{grandTotal.toFixed(2)}</span>
                    </div>

                    {/* 🌟 ปุ่มคัดลอกส่งไลน์ (ตอบโจทย์พฤติกรรมจริง) */}
                    <button onClick={handleCopySummary} className="w-full py-2.5 bg-orange-100 text-[#ea580c] rounded-xl text-xs font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-1.5 mb-2 border-none cursor-pointer">
                      <Copy size={14} /> คัดลอกข้อความสรุปยอด
                    </button>
                  </>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="sharekub-card-wrapper !mb-0">
                <Summary summaries={summaries} config={config} setConfig={setConfig} />
                <button onClick={handleSaveBill} className="w-full mt-6 py-3.5 bg-[#1e3a8a] text-white rounded-xl text-sm font-bold hover:bg-[#172b66] transition-all flex justify-center items-center gap-2 border-none cursor-pointer shadow-sm">
                  💾 บันทึกบิลนี้ลงในอุปกรณ์
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="w-full max-w-4xl mx-auto">
          <div className="sharekub-card-wrapper">
            {history.length > 0 ? (
              <BillHistory history={history} onRemoveHistory={removeHistory} />
            ) : (
              <div className="text-center py-20 text-slate-400">
                <span className="text-6xl block mb-4 opacity-50">📭</span>
                <p className="text-lg font-bold text-slate-500">ยังไม่มีประวัติการหารบิล</p>
                <p className="text-sm mt-1">บิลที่คุณบันทึกจะมาแสดงอยู่ที่นี่ (บันทึกในอุปกรณ์นี้เท่านั้น)</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}