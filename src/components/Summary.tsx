"use client";

import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { PersonSummary } from "../types";

interface Props {
  summaries: PersonSummary[];
  promptPay: string;
}

export default function Summary({ summaries, promptPay }: Props) {
  if (summaries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaries.map(summary => {
          if (summary.totalBeforeTax === 0) return null;
          
          const qrPayload = promptPay ? generatePayload(promptPay.trim(), { amount: summary.finalAmount }) : "";

          return (
            <div key={summary.person.id} className="border border-gray-200 p-4 rounded-xl flex flex-col bg-gray-50/50 shadow-sm relative overflow-hidden">
              
              <p className="font-bold text-gray-800 text-base text-center mb-3">👤 {summary.person.name}</p>
              
              {/* รายการอาหารย่อย */}
              <div className="bg-white border border-gray-100 rounded-lg p-2.5 mb-2 space-y-1.5 text-xs text-gray-600 shadow-sm">
                {summary.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                    <span className="truncate pr-2">- {item.name}</span>
                    <span className="font-medium text-gray-800 shrink-0">฿{item.cost.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* 🌟 แสดงรายละเอียดการคำนวณและส่วนต่างการปัดเศษเพื่อความโปร่งใส */}
              <div className="bg-slate-100/70 p-2 rounded-lg text-[11px] text-slate-500 space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>ยอดคำนวณจริง (รวม VAT/SC):</span>
                  <span>฿{summary.totalWithTax.toFixed(2)}</span>
                </div>
                {summary.roundingAdjustment !== 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>ส่วนต่างจากการปัดเศษ:</span>
                    <span>{summary.roundingAdjustment > 0 ? `+฿${summary.roundingAdjustment.toFixed(2)}` : `-฿${Math.abs(summary.roundingAdjustment).toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              {/* ยอดสุทธิ */}
              <div className="text-center mb-1">
                <span className="text-[10px] text-gray-400 block mb-0.5">ยอดชำระสุทธิ</span>
                <p className="text-2xl font-black text-[#ea580c]">
                  ฿{summary.finalAmount.toFixed(2)}
                </p>
              </div>
              
              {/* QR Code */}
              {promptPay ? (
                 <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center mt-3">
                   <QRCodeSVG value={qrPayload} size={110} level="M" />
                   <p className="text-[10px] text-center mt-2 font-semibold text-gray-400">สแกนจ่ายได้เลย</p>
                 </div>
              ) : (
                <div className="flex items-center justify-center bg-slate-100 text-slate-400 p-3 rounded-xl w-full mt-3 border border-slate-200 border-dashed text-xs text-center">
                  ยังไม่ได้ใส่เบอร์ PromptPay
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}