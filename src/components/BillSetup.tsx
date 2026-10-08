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
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">VAT (%)</label>
            <input type="number" value={config.vat || ""} onChange={(e) => handleChange("vat", parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Service Charge (%)</label>
            <input type="number" value={config.serviceCharge || ""} onChange={(e) => handleChange("serviceCharge", parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">การปัดเศษยอดเงิน (Rounding)</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
            {(["none", "whole"] as const).map((type) => {
              const labelMap = { none: "ไม่ปัดเศษ", whole: "ปัดเป็นจำนวนเต็ม" };
              const isActive = config.rounding === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("rounding", type)}
                  className="text-xs py-2.5 px-2 font-bold rounded-full transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#ea580c" : "#64748b",
                    border: isActive ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 12px rgba(249, 115, 22, 0.08)" : "none"
                  }}
                >
                  {labelMap[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}