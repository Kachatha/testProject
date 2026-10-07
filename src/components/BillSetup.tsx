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
          <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1">
            🔒 ข้อมูลเบอร์โทรจะถูกบันทึกไว้ในเครื่องของคุณเท่านั้น
          </p>
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
          <label className="block text-xs font-semibold text-slate-500 mb-1">วิธีปัดเศษยอดเงิน (Rounding)</label>
          <p className="text-[10px] text-slate-400 mb-2">ช่วยให้โอนเงินง่ายขึ้นโดยการปัดเศษยอดของแต่ละคนให้เป็นจำนวนเต็ม</p>
          
          {/* 🌟 เปลี่ยนแถบปุ่มปัดเศษให้เป็นทรงแคปซูล (Rounded-full) */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
            {(["none", "tens", "hundreds"] as const).map((type) => {
              const labelMap = { none: "ไม่ปัดเศษ", tens: "ปัดเป็นหลักสิบ", hundreds: "ปัดเป็นหลักร้อย" };
              const isActive = config.rounding === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("rounding", type)}
                  className="text-xs py-2.5 px-2 font-bold rounded-full transition-all duration-150 select-none cursor-pointer"
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