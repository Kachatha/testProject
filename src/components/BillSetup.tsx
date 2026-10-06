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
      <h2 className="text-sm font-bold text-slate-700 mb-2">ตั้งค่าระบบบิลชำระเงิน</h2>

      {/* จัดเรียงพิกเซล Inputs ซ้อนดิ่งลื่นไหลตามแบบภาพที่ 2 ปรับปรุงความคลีน */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">เบอร์ PromptPay (สำหรับทำ QR Code สแกนจ่าย):</label>
          <input
            type="text"
            placeholder="08XXXXXXXX"
            value={config.promptPay}
            onChange={(e) => handleChange("promptPay", e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">ภาษีมูลค่าเพิ่ม VAT (%)</label>
          <input
            type="number"
            placeholder="0"
            value={config.vat || ""}
            onChange={(e) => handleChange("vat", parseFloat(e.target.value) || 0)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">ค่าบริการ Service Charge (%)</label>
          <input
            type="number"
            placeholder="0"
            value={config.serviceCharge || ""}
            onChange={(e) => handleChange("serviceCharge", parseFloat(e.target.value) || 0)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">การปัดเศษทศนิยม (Rounding)</label>
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
            {(["none", "tens", "hundreds"] as const).map((type) => {
              const labelMap = { none: "ไม่ปัดเศษ", tens: "ปัดขึ้นหลักสิบ", hundreds: "ปัดขึ้นหลักร้อย" };
              const isActive = config.rounding === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("rounding", type)}
                  className="text-xs py-2 px-1 font-bold rounded-lg transition-all duration-150 select-none cursor-pointer"
                  style={{
                    backgroundColor: isActive ? "#fff7ed" : "#ffffff",
                    color: isActive ? "#ea580c" : "#475569",
                    border: isActive ? "2px solid #f97316" : "1px solid #e2e8f0",
                    boxShadow: isActive ? "0 4px 10px rgba(249, 115, 22, 0.05)" : "none"
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
