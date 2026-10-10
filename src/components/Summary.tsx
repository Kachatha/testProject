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
    <div className="space-y-6">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <label className="block text-xs font-bold text-emerald-400 mb-2"> ตั้งค่า PromptPay เพื่อรับเงิน (ไม่บังคับ)</label>
        <input
          type="text"
          placeholder="กรอกเบอร์โทร หรือ เลขบัตรปชช."
          value={config.promptPay}
          onChange={(e) => setConfig(prev => ({ ...prev, promptPay: e.target.value.replace(/\D/g, "") }))}
          className="cyber-input"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaries.map(summary => {
          if (summary.totalBeforeTax === 0 && summary.finalAmount === 0) return null;
          
          const qrPayload = config.promptPay ? generatePayload(config.promptPay.trim(), { amount: summary.finalAmount }) : "";

          return (
            <div key={summary.person.id} className="border border-slate-800 p-4 rounded-3xl flex flex-col bg-slate-900/60">
              <p className="font-bold text-slate-100 text-sm mb-3 border-b border-slate-800 pb-2">👤 {summary.person.name}</p>
              
              <div className="space-y-1.5 text-[11px] text-slate-400 mb-4 font-mono">
                {summary.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="font-medium shrink-0 text-slate-300">฿{item.cost.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between font-bold text-emerald-400 text-xs">
                  <span>รวมสุทธิ</span>
                  <span>฿{summary.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {config.promptPay ? (
                <>
                  <button 
                    onClick={() => setShowQRFor(showQRFor === summary.person.id ? null : summary.person.id)}
                    className="mt-auto py-2.5 w-full rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border-none cursor-pointer"
                  >
                    {showQRFor === summary.person.id ? "ซ่อน QR Code" : "💳 สร้าง QR สแกนจ่าย"}
                  </button>
                  
                  {showQRFor === summary.person.id && (
                    <div className="mt-3 p-4 bg-white rounded-2xl flex flex-col items-center animate-in fade-in duration-200">
                      <QRCodeSVG value={qrPayload} size={130} level="M" />
                      <p className="text-[10px] text-slate-800 font-bold mt-2">สแกนจ่าย ฿{summary.finalAmount.toFixed(2)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-auto text-[10px] text-center text-slate-500 bg-slate-950 py-2 rounded-2xl border border-slate-800">
                  ใส่เบอร์ PromptPay เพื่อสร้าง QR
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}