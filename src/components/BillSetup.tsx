"use client";

import { BillConfig } from "../types";

interface BillSetupProps {
  config: BillConfig;
  setConfig: React.Dispatch<React.SetStateAction<BillConfig>>;
}

export default function BillSetup({ config, setConfig }: BillSetupProps) {
  const handleChange = (key: keyof BillConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">VAT (%)</label>
          <input 
            type="number" 
            value={config.vat || ""} 
            onChange={(e) => handleChange("vat", parseFloat(e.target.value) || 0)} 
            className="cyber-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Service Charge (%)</label>
          <input 
            type="number" 
            value={config.serviceCharge || ""} 
            onChange={(e) => handleChange("serviceCharge", parseFloat(e.target.value) || 0)} 
            className="cyber-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">การปัดเศษยอดเงิน (Rounding)</label>
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
          {(["none", "whole"] as const).map((type) => {
            const labelMap = { none: "ไม่ปัดเศษ", whole: "ปัดเป็นจำนวนเต็ม" };
            const isActive = config.rounding === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleChange("rounding", type)}
                className={`toggle-btn ${isActive ? 'active' : ''}`}
              >
                {labelMap[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}