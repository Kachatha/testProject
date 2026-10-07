"use client";

import { useState } from "react";
import { BillHistoryItem } from "../types";
import { History, Calendar, CreditCard, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface BillHistoryProps {
  history: BillHistoryItem[];
  onRemoveHistory: (id: string) => void;
}

export default function BillHistory({ history, onRemoveHistory }: BillHistoryProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (history.length === 0) return null;

  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <History size={18} />
        </div>
        <h2 className="text-sm font-bold text-slate-700"> ประวัติการหารบิลย้อนหลัง</h2>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              {/* ส่วนแถบสรุปด้านหัวการ์ดประวัติ */}
              <div 
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50/50 transition-all"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block"> {item.title}</span>
                  <div className="text-[9px] text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Calendar size={10} /> {item.date}</span>
                    <span className="flex items-center gap-0.5"><CreditCard size={10} /> ยอดรวม: {item.grandTotal.toFixed(2)} บ.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveHistory(item.id); }}
                    className="p-1 text-slate-300 hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                  {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </div>

              {/* ส่วนแสดงรายระเอียดการจ่ายของแต่ละคนเมื่อกดกางการ์ดออก */}
              {isOpen && (
                <div className="p-3 bg-slate-50/40 border-t border-slate-50 text-[11px] text-slate-600 space-y-2">
                  <div className="font-bold text-[10px] text-slate-400">สรุปยอดชำระรายบุคคลในบิลนี้:</div>
                  {item.summaries.map((s) => (
                    <div key={s.person.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-medium"> {s.person.name}</span>
                      <strong className="text-emerald-600">฿{s.finalAmount.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
