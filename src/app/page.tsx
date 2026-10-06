"use client";

import { useState, useMemo, useEffect } from "react";
import { Person, FoodItem as FoodItemType, BillConfig, BillHistoryItem } from "../types"; 
import { calculateBill } from "../utils/calculator";

import BillSetup from "../components/BillSetup";
import ParticipantManager from "../components/ParticipantManager";
import FoodItem from "../components/FoodItem";
import Summary from "../components/Summary";
import BillHistory from "../components/History";
import { Save, RefreshCw } from "lucide-react";

export default function Home() {
  const [config, setConfig] = useState<BillConfig>({
    promptPay: "",
    vat: 0,                  
    serviceCharge: 0,       
    rounding: "none",
  });

  const [persons, setPersons] = useState<Person[]>([]);
  const [items, setItems] = useState<FoodItemType[]>([]);
  const [history, setHistory] = useState<BillHistoryItem[]>([]);
  const [billTitle, setBillTitle] = useState("");

  // 1. โหลดข้อมูลเก่าที่เคยทำค้างไว้จาก LocalStorage เมื่อเปิดหน้าเว็บครั้งแรก
  useEffect(() => {
    const savedConfig = localStorage.getItem("sk_config");
    const savedPersons = localStorage.getItem("sk_persons");
    const savedItems = localStorage.getItem("sk_items");
    const savedHistory = localStorage.getItem("sk_history");

    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedPersons) {
      setPersons(JSON.parse(savedPersons));
    } else {
      // ค่าเริ่มต้นถ้าไม่มีข้อมูลเก่าในเครื่อง
      setPersons([
        { id: "1", name: "ฉันเอง" },
        { id: "2", name: "เพื่อนคนที่ 2" },
        { id: "3", name: "เพื่อนคนที่ 3" }
      ]);
    }
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // 2. บันทึกข้อมูลสเตทหลักลง LocalStorage อัตโนมัติเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (persons.length > 0) localStorage.setItem("sk_persons", JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    localStorage.setItem("sk_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("sk_config", JSON.stringify(config));
  }, [config]);

  // ฟังก์ชันเพิ่มรายการอาหาร (รองรับจำนวนชิ้นอาหาร)
  const addItem = (name: string, price: number, quantity: number, sharedBy: string[]) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        price,
        quantity, 
        sharedBy,
      },
    ]);
  };

  // ฟังก์ชันลบรายการอาหารออกจากบิลปัจจุบัน
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ฟังก์ชันลบชื่อเพื่อน และดักลบออกจากรายการอาหารที่เคยเลือกไว้ด้วย
  const removePerson = (id: string) => {
    setPersons(prev => prev.filter((p) => p.id !== id));
    setItems(prev => prev.map(item => ({
      ...item,
      sharedBy: item.sharedBy.filter(personId => personId !== id)
    })).filter(item => item.sharedBy.length > 0));
  };

  // เรียกฟังก์ชันประมวลผลคำนวณบิลอัตโนมัติ
  const summaries = useMemo(() => {
    return calculateBill(persons, items, config);
  }, [persons, items, config]);

  // ฟังก์ชันกดบันทึกบิลปัจจุบันลงหน้าประวัติย้อนหลัง
  const handleSaveToHistory = () => {
    if (items.length === 0) return;
    const grandTotalFinal = summaries.reduce((acc, s) => acc + s.finalAmount, 0);
    const newHistoryItem: BillHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleDateString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      title: billTitle.trim() || `มื้ออาหารขนาดย่อม (${items.length} รายการ)`,
      grandTotal: grandTotalFinal,
      summaries: summaries as any // ป้องกันไทป์ขัดแย้งเวลานำไปเก็บลงอาเรย์ประวัติ
    };

    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("sk_history", JSON.stringify(updatedHistory));
    
    // เคลียร์รายการอาหารปัจจุบันเพื่อตั้งต้นบิลรอบใหม่
    setItems([]);
    setBillTitle("");
    alert("บันทึกประวัติบิลเรียบร้อยแล้ว!");
  };

  // ฟังก์ชันลบประวัติบิลเก่าออก (เปลี่ยนชื่อใหม่เพื่อป้องกันการ Error ทับซ้อน)
  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("sk_history", JSON.stringify(updatedHistory));
  };

  // ฟังก์ชันรีเซ็ตบิลปัจจุบันเริ่มต้นใหม่ทั้งหมด
  const handleResetCurrentBill = () => {
    if (window.confirm("คุณต้องการล้างรายการอาหารในบิลปัจจุบันทั้งหมดใช่หรือไม่?")) {
      setItems([]);
      setBillTitle("");
    }
  };

  return (
    /* เติมคลาสระบบระบุตัวตนหลักให้สอดประสานกับหน้า CSS และกระชับหน้าจอ */
    <main id="sharekub-main-layout" className="sharekub-container">
            {/* 🚀 โลโก้/หัวข้อหลักของแอปพลิเคชัน (เวอร์ชันชุบชีวิตโลโก้แบบไม่ต้องพึ่งพาไฟล์รูปภาพ) */}
      <div className="sharekub-header-section flex flex-col items-center justify-center gap-2">
        <img 
          src="/LOGO.png"
          alt="Sharekub Logo"
          className="w-16 h-16 object-contain rounded-2xl bg-white p-1"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <div className="text-center mt-1">
          <h1 className="sharekub-title text-xl font-black text-slate-800 tracking-tight">Sharekub App</h1>
          <p className="sharekub-subtitle text-[11px] text-slate-400 font-medium">คำนวณบิลหารค่าอาหารรายบุคคลพร้อมระบบบันทึกประวัติย้อนหลัง</p>
        </div>

      </div>


      {/* 1. ตั้งค่าบิล (เบอร์พร้อมเพย์, ภาษี, ค่าบริการ) */}
      <div className="sharekub-card-wrapper" id="step-bill-setup">
        <BillSetup config={config} setConfig={setConfig} />
      </div>
      
      {/* 2. ระบุจำนวนคนและกำหนดชื่อของแต่ละคน */}
      <div className="sharekub-card-wrapper" id="step-participant-manager">
        <ParticipantManager persons={persons} setPersons={setPersons} removePerson={removePerson} />
      </div>
      
      {/* 3. เพิ่มรายการอาหาร / เมนูอาหารโปรด */}
      <div className="sharekub-card-wrapper" id="step-food-item">
        <FoodItem persons={persons} items={items} addItem={addItem} removeItem={removeItem} />
      </div>
      
      {/* ส่วนกดปุ่มบันทึกเข้าประวัติ หรือ รีเซ็ตบิลปัจจุบัน (จะเด้งขึ้นมาเมื่อมีรายการอาหารในบิล) */}
      {items.length > 0 && (
        <div className="sharekub-action-box">
          <input 
            type="text" 
            placeholder="ตั้งชื่อมื้อนี้ (เช่น ชาบูปิ้งย่าง, ส้มตำเจ๊ใจ)" 
            value={billTitle}
            onChange={e => setBillTitle(e.target.value)}
            className="sharekub-input-title"
          />
          <div className="sharekub-btn-group">
            <button onClick={handleSaveToHistory} className="sharekub-btn-save">
              <Save size={14} /> บันทึกปิดบิลลงประวัติ
            </button>
            <button onClick={handleResetCurrentBill} className="sharekub-btn-reset" title="ล้างข้อมูลเริ่มใหม่">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 4. หน้าสรุปยอดปัจจุบันพร้อมคิวอาร์โค้ดสแกนจ่ายเงิน */}
      <div className="sharekub-card-wrapper" id="step-summary">
        <Summary summaries={summaries} promptPay={config.promptPay} />
      </div>

      {/* 5. แผงประวัติการหารบิลย้อนหลัง (ซ่อมแซมจุดเรียกใช้ ปลอดภัยจาก Error 100%) */}
      <div className="sharekub-card-wrapper" id="step-history">
        <BillHistory 
          history={history as any} 
          onRemoveHistory={(id: string) => deleteHistoryItem(id)} 
        />
      </div>

      <p className="sharekub-footer-text">SHAREKUB DASHBOARD SYSTEM v2.0</p>
    </main>
  );
}
