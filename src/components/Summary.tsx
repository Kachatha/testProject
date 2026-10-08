"use client";

import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { PersonSummary, BillConfig } from "../types";
import { useState } from "react";

interface Props {
  summaries: PersonSummary[];
  config: BillConfig;
  setConfig: React.Dispatch<React.SetStateAction<BillConfig>>;
}

export default function Summary({ summaries, config, setConfig }: Props) {
  const [showQRFor, setShowQRFor] = useState<string | null>(null);

  if (summaries.length === 0) return null;

  return (
    <div className="bg-white/50 rounded-2xl">
      {/* 🌟 ย้ายการกรอก PromptPay มาใน Flow หลัก */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
        <label className="block text-xs font-bold text-[#ea580c] mb-2">💳 ตั้งค่า PromptPay เพื่อรับเงิน (ไม่บังคับ)</label>
        <input
          type="text"
          placeholder="กรอกเบอร์โทร หรือ เลขบัตรปชช."
          value={config.promptPay}
          onChange={(e) => setConfig(prev => ({ ...prev, promptPay: e.target.value.replace(/\D/g, "") }))}
          className="w-full bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaries.map(summary => {
          if (summary.totalBeforeTax === 0 && summary.finalAmount === 0) return null;
          
          const qrPayload = config.promptPay ? generatePayload(config.promptPay.trim(), { amount: summary.finalAmount }) : "";

          return (
            <div key={summary.person.id} className="border border-slate-200 p-4 rounded-3xl flex flex-col bg-white shadow-sm">
              <p className="font-bold text-slate-800 text-lg mb-3 border-b border-slate-100 pb-2">👤 {summary.person.name}</p>
              
              {/* 🌟 ใบเสร็จแจกแจงแบบโปร่งใส (Transparency) */}
              <div className="space-y-1.5 text-[11px] text-slate-600 mb-4 font-mono">
                {summary.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="font-medium shrink-0">฿{item.cost.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-200 pt-1.5 mt-1.5 flex justify-between font-bold text-slate-800 text-xs">
                  <span>รวมสุทธิ</span>
                  <span>฿{summary.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* ปุ่มสร้าง QR Code */}
              {config.promptPay ? (
                <>
                  <button 
                    onClick={() => setShowQRFor(showQRFor === summary.person.id ? null : summary.person.id)}
                    className="mt-auto py-2.5 w-full rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    {showQRFor === summary.person.id ? "ซ่อน QR Code" : "💳 สร้าง QR ให้คนนี้สแกนจ่าย"}
                  </button>
                  
                  {showQRFor === summary.person.id && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-100 shadow-inner flex flex-col items-center animate-in fade-in zoom-in duration-200">
                      <QRCodeSVG value={qrPayload} size={130} level="M" />
                      <p className="text-[10px] text-slate-400 font-semibold mt-2">ยอดสแกนจ่าย ฿{summary.finalAmount.toFixed(2)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-auto text-[10px] text-center text-slate-400 bg-slate-50 py-2 rounded-xl border border-slate-100">
                  ใส่เบอร์ PromptPay ด้านบนเพื่อสร้าง QR
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}