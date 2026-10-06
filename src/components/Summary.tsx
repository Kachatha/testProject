"use client";

import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { PersonSummary } from "../types";

interface Props {
  summaries: PersonSummary[];
  promptPay: string; // รับเบอร์พร้อมเพย์ที่เป็น string ตรงๆ มาจากหน้า page.tsx
}

export default function Summary({ summaries, promptPay }: Props) {
  if (summaries.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">3. สรุปยอดที่ต้องจ่าย</h2>
      
      {/* ปรับ Grid ให้รองรับการ์ดของเพื่อนๆ ได้อย่างสวยงาม */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaries.map(summary => {
          if (summary.finalAmount === 0) return null;
          
          //  แก้ไขตรงนี้: ส่งค่าตัวเลข summary.finalAmount เข้าไปตรงๆ (ไม่ต้องใส่ปีกกาครอบ)
          const qrPayload = promptPay ? generatePayload(promptPay.trim(), { amount: summary.finalAmount }) : "";

          return (
            <div key={summary.person.id} className="border border-gray-100 p-4 rounded-xl flex flex-col items-center bg-gray-50/50">
              <p className="font-bold text-gray-800 text-base">{summary.person.name}</p>
              
              {/* แสดงยอดสุทธิหลังปัดเศษ */}
              <p className="text-2xl font-black text-green-600 my-1">
                ฿{summary.finalAmount.toFixed(2)}
              </p>
              
              {/* แสดงยอดดิบก่อนบวกแวต/บริการเพื่อให้เพื่อนสบายใจ */}
              <p className="text-[10px] text-gray-400 mb-3">(ค่าอาหารเดิม {summary.totalBeforeTax.toFixed(2)} บาท)</p>
              
              {promptPay ? (
                 <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                   <QRCodeSVG value={qrPayload} size={130} level="M" />
                   <p className="text-[10px] text-center mt-1.5 font-semibold text-gray-400">สแกนจ่ายได้เลย</p>
                 </div>
              ) : (
                <div className="flex items-center justify-center bg-red-50 text-red-500 p-4 rounded-xl w-full h-[160px] border border-red-100/50">
                  <p className="text-xs font-medium text-center leading-relaxed">
                    กรุณากรอกเบอร์พร้อมเพย์<br/>ที่เมนูตั้งค่าบิลด้านบน<br/>เพื่อสร้าง QR Code
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
