"use client";

import React, { useState, useMemo } from "react";
import { useSession, signIn } from "next-auth/react"; 
import ParticipantManager from "../components/ParticipantManager";
import FoodItem from "../components/FoodItem";
import Summary from "../components/Summary";
import BillSetup from "../components/BillSetup";
import BillHistory from "../components/History";
import { AuthButtons } from "./auth-buttons"; 
import { Person, FoodItem as FoodItemType, BillConfig, BillHistoryItem } from "../types";
import { calculateBill } from "../utils/calculator";
import { Sparkles, PlusCircle, History as HistoryIcon, RotateCcw, Lock, LogIn, Settings, ChevronDown, ChevronRight, Receipt, Copy } from "lucide-react";

export default function ShareKubApp() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [history, setHistory] = useState<BillHistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
  
  const removeHistory = (id: string) => {
    if (window.confirm("ลบประวัติบิลนี้หรือไม่?")) {
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

  const handleNewBill = () => {
    if (items.length > 0 && !window.confirm(`ล้างข้อมูลอาหารทั้งหมด ${items.length} รายการ?`)) return;
    setItems([]);
    setPersons([{ id: "1", name: "คุณ" }, { id: "2", name: "เพื่อน 1" }]);
    setBillName("");
    setActiveTab('current');
  };

  const handleSaveBill = () => {
    if (items.length === 0) return;

    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    const finalBillName = billName.trim() || `บิลวันที่ ${dateStr}`;
    const newHistory: BillHistoryItem = { id: Date.now().toString(), date: dateStr, title: `${finalBillName} (${persons.length} คน)`, grandTotal, summaries };
    setHistory(prev => [newHistory, ...prev]);
    alert("💾 บันทึกบิลลงประวัติเรียบร้อยแล้ว!");
    setActiveTab('history');
  };

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
    alert("📋 คัดลอกข้อความสรุปยอดเรียบร้อยแล้ว!");
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 relative">
      <div className="aurora-glow" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Floating Navbar */}
        <header className="glass-panel p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-emerald-400">
                SHAREKUB
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Smart Bill Splitter</p>
            </div>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-full border border-slate-800">
            <button 
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'current' 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle size={14} /> บิลปัจจุบัน
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HistoryIcon size={14} /> ประวัติ {history.length > 0 && `(${history.length})`}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleNewBill}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700/60 transition-all cursor-pointer"
              title="เริ่มบิลใหม่"
            >
              <RotateCcw size={16} />
            </button>
            <AuthButtons />
          </div>
        </header>

        {/* Modal เตือน Guest เมื่อกดบันทึก */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel p-8 max-w-sm w-full text-center space-y-5 border border-emerald-500/30">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Lock size={26} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white mb-1">เข้าสู่ระบบเพื่อบันทึกบิล</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  กรุณาเข้าสู่ระบบด้วย Google เพื่อบันทึกประวัติบิลนี้ไว้ดูย้อนหลังได้ทุกที่
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => signIn("google")}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <LogIn size={16} /> เข้าสู่ระบบด้วย Google
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-2.5 bg-slate-800/60 text-slate-400 rounded-2xl text-xs font-bold hover:text-white hover:bg-slate-800 transition-all border-none cursor-pointer"
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'current' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Inputs) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Bill Title Input */}
              <div className="glass-panel p-4">
                <input 
                  type="text" 
                  placeholder="✨ พิมพ์ชื่อร้านหรือชื่อบิลที่นี่... (เช่น หมูกระทะเสาร์นี้)" 
                  value={billName} 
                  onChange={e => setBillName(e.target.value)} 
                  className="w-full text-center text-base font-bold bg-transparent border-none text-emerald-400 placeholder:text-slate-500" 
                />
              </div>

              <div className="glass-panel p-6">
                <ParticipantManager persons={persons} setPersons={setPersons} removePerson={removePerson} items={items} />
              </div>

              <div className="glass-panel p-6">
                <FoodItem persons={persons} items={items} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />
              </div>

              <div className="glass-panel p-5">
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className="w-full flex justify-between items-center text-xs font-bold text-slate-300 bg-transparent border-none cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings size={16} className="text-emerald-400" />
                    ตั้งค่า VAT & Service Charge
                  </span>
                  {showSettings ? <ChevronDown size={18} className="text-emerald-400" /> : <ChevronRight size={18} className="text-slate-500" />}
                </button>
                
                {showSettings && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
                    <BillSetup config={config} setConfig={setConfig} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Live Summary Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
              
              <div className="glass-panel-accent p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Receipt size={18} className="text-emerald-400" /> สรุปยอดชำระ
                  </h2>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                    items.length > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {items.length > 0 ? `คำนวณแล้ว (${items.length} รายการ)` : 'ยังไม่มีรายการ'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                    เพิ่มรายการอาหารทางฝั่งซ้าย<br />เพื่อเริ่มคิดคำนวณยอดเงิน
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 text-xs text-slate-400 mb-6 border-b border-slate-800/80 pb-4">
                      <div className="flex justify-between"><span>ค่าอาหารรวม</span> <span className="text-slate-200 font-mono">฿{totalFoodPrice.toFixed(2)}</span></div>
                      {config.serviceCharge > 0 && <div className="flex justify-between"><span>Service Charge ({config.serviceCharge}%)</span> <span className="text-slate-200 font-mono">฿{serviceChargeAmount.toFixed(2)}</span></div>}
                      {config.vat > 0 && <div className="flex justify-between"><span>VAT ({config.vat}%)</span> <span className="text-slate-200 font-mono">฿{vatAmount.toFixed(2)}</span></div>}
                      {roundingDiff !== 0 && <div className="flex justify-between text-amber-400"><span>การปัดเศษ</span> <span className="font-mono">{roundingDiff > 0 ? '+' : ''}฿{roundingDiff.toFixed(2)}</span></div>}
                    </div>

                    <div className="space-y-2.5 mb-6">
                      {persons.map(p => {
                        const personSummary = summaries.find(s => s.person.id === p.id);
                        const amount = personSummary ? personSummary.finalAmount : 0;
                        if (amount === 0) return null;
                        return (
                          <div key={p.id} className="flex justify-between items-center text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                            <span className="font-semibold text-slate-300">👤 {p.name}</span>
                            <span className="text-emerald-400 font-black text-sm font-mono">฿{amount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex justify-between items-end mb-6">
                      <span className="text-xs font-bold text-slate-400">ยอดรวมสุทธิ</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight font-mono">
                        ฿{grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <button 
                      onClick={handleCopySummary} 
                      className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      <Copy size={14} /> คัดลอกสรุปส่งลงแชต
                    </button>
                  </>
                )}
              </div>

              {items.length > 0 && (
                <div className="glass-panel p-6 space-y-4">
                  <Summary summaries={summaries} config={config} setConfig={setConfig} />
                  <button 
                    onClick={handleSaveBill} 
                    className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all flex justify-center items-center gap-2 border-none cursor-pointer"
                  >
                    💾 บันทึกบิลลงประวัติ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto glass-panel p-6">
            {history.length > 0 ? (
              <BillHistory history={history} onRemoveHistory={removeHistory} />
            ) : (
              <div className="text-center py-20 text-slate-500 space-y-3">
                <HistoryIcon size={48} className="mx-auto text-slate-700 stroke-1" />
                <p className="text-sm font-bold text-slate-400">ยังไม่มีประวัติการหารบิล</p>
                <p className="text-xs text-slate-600">บิลที่คุณกดบันทึกจะแสดงรายชื่อและยอดชำระที่นี่</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}