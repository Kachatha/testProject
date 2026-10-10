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
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <History size={18} />
        </div>
        <h2 className="text-sm font-bold text-slate-200">ประวัติการหารบิลย้อนหลัง</h2>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {history.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div 
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-800/40 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200 block">{item.title}</span>
                  <div className="text-[10px] text-slate-500 flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {item.date}</span>
                    <span className="flex items-center gap-1"><CreditCard size={11} /> ยอดรวม: {item.grandTotal.toFixed(2)} THB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveHistory(item.id); }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-all bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                  <div className="font-bold text-[10px] text-slate-500">สรุปยอดชำระรายบุคคล:</div>
                  {item.summaries.map((s) => (
                    <div key={s.person.id} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span>👤 {s.person.name}</span>
                      <strong className="text-emerald-400 font-mono">฿{s.finalAmount.toFixed(2)}</strong>
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