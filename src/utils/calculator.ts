import { Person, FoodItem, BillConfig, PersonSummary } from '../types';

export const calculateBill = (
  persons: Person[],
  items: FoodItem[],
  config: BillConfig
): PersonSummary[] => {
  // 1. สร้างสรุปยอดเบื้องต้นให้ทุกคนเป็น 0 (เพิ่ม items: [] เพื่อแก้ Error พิมพ์เขียวไม่ครบ)
  let summaries: Record<string, PersonSummary> = {};
  persons.forEach(p => {
    summaries[p.id] = {
      person: p,
      totalBeforeTax: 0,
      totalWithTax: 0,
      finalAmount: 0,
      items: [], // ✨ เพิ่มตรงนี้เพื่อแก้ขัดแย้งของ Type
    };
  });

  // 2. คำนวณค่าอาหารแต่ละเมนู หารตามจำนวนคนกิน
  items.forEach(item => {
    if (item.sharedBy.length > 0) {
      // เปลี่ยนตรงนี้: นำราคาคูณด้วยจำนวนชิ้น (item.quantity) ก่อนหาร
      const totalPrice = item.price * (item.quantity || 1);
      const splitPrice = totalPrice / item.sharedBy.length;
      
      item.sharedBy.forEach(personId => {
        if (summaries[personId]) {
          summaries[personId].totalBeforeTax += splitPrice;
          summaries[personId].items.push({
            name: `${item.name} x${item.quantity || 1}`, // แสดงจำนวนในใบเสร็จย่อย
            cost: splitPrice
          });
        }
      });
    }
  });
  // 3. คิด SC, VAT และปัดเศษ
  return Object.values(summaries).map(summary => {
    let currentTotal = summary.totalBeforeTax;

    // บวก Service Charge
    if (config.serviceCharge > 0) {
      currentTotal += currentTotal * (config.serviceCharge / 100);
    }

    // บวก VAT
    if (config.vat > 0) {
      currentTotal += currentTotal * (config.vat / 100);
    }

    summary.totalWithTax = currentTotal;

    // การปัดเศษ (Rounding) ปรับคีย์ให้แมตช์ตามค่าที่เลือกจากหน้าเว็บ
    let finalAmt = currentTotal;
    if (config.rounding === 'tens') {
      finalAmt = Math.ceil(currentTotal / 10) * 10; // ปัดขึ้นหลักสิบ
    } else if (config.rounding === 'hundreds') {
      finalAmt = Math.ceil(currentTotal / 100) * 100; // ปัดขึ้นหลักร้อย
    }

    summary.finalAmount = finalAmt;
    return summary;
  });
};
