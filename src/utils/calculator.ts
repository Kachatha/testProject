import { Person, FoodItem, BillConfig, PersonSummary } from '../types';

export const calculateBill = (
  persons: Person[],
  items: FoodItem[],
  config: BillConfig
): PersonSummary[] => {
  let summaries: Record<string, PersonSummary> = {};
  persons.forEach(p => {
    summaries[p.id] = { person: p, totalBeforeTax: 0, totalWithTax: 0, finalAmount: 0, roundingAdjustment: 0, items: [] };
  });

  // 🌟 1. ระบบจัดการเศษสตางค์ (รับประกันว่า 100/3 = 33.34 + 33.33 + 33.33 รวมกันได้ 100 เป๊ะ)
  items.forEach(item => {
    const count = item.sharedBy.length;
    if (count > 0) {
      const total = item.price * (item.quantity || 1);
      const totalCents = Math.round(total * 100);
      const baseCent = Math.floor(totalCents / count);
      let remainder = totalCents - (baseCent * count); // เศษสตางค์ที่หารไม่ลงตัว

      item.sharedBy.forEach((personId) => {
        let currentCent = baseCent;
        // กระจายเศษสตางค์ให้คนแรกๆ ทีละ 1 สตางค์จนกว่าเศษจะหมด
        if (remainder > 0) {
          currentCent += 1;
          remainder -= 1;
        }
        const cost = currentCent / 100;

        if (summaries[personId]) {
          summaries[personId].totalBeforeTax += cost;
          summaries[personId].items.push({
            name: `${item.name} (หาร ${count})`,
            cost: cost
          });
        }
      });
    }
  });

  // 2. คำนวณ VAT & Service Charge ตามยอดของแต่ละคน
  let exactGrandTotal = 0;
  const result = Object.values(summaries).map(summary => {
    let currentTotal = summary.totalBeforeTax;
    
    // Service Charge ก่อน
    let scAmount = 0;
    if (config.serviceCharge > 0) {
      scAmount = currentTotal * (config.serviceCharge / 100);
      summary.items.push({ name: `Service Charge (${config.serviceCharge}%)`, cost: scAmount });
      currentTotal += scAmount;
    }

    // แล้วค่อยคิด VAT จากยอดที่รวม SC แล้ว
    let vatAmount = 0;
    if (config.vat > 0) {
      vatAmount = currentTotal * (config.vat / 100);
      summary.items.push({ name: `VAT (${config.vat}%)`, cost: vatAmount });
      currentTotal += vatAmount;
    }

    summary.totalWithTax = currentTotal;
    summary.finalAmount = currentTotal;
    exactGrandTotal += currentTotal;
    
    return summary;
  });

  // 🌟 3. ระบบปัดเศษยอดรวมเป็นจำนวนเต็ม (ใครรับส่วนต่าง? -> โยนให้คนแรก)
  if (config.rounding === 'whole') {
    const roundedGrandTotal = Math.round(exactGrandTotal);
    let currentRoundedSum = 0;

    result.forEach(summary => {
      const rounded = Math.round(summary.totalWithTax);
      summary.finalAmount = rounded;
      summary.roundingAdjustment = rounded - summary.totalWithTax;
      currentRoundedSum += rounded;
    });

    // ถ้าผลรวมของการปัดเศษแต่ละคน ไม่ตรงกับยอดรวมบิลที่ปัดเศษ ให้เอาส่วนต่างไปโปะคนแรกที่มีการจ่ายเงิน
    const diff = roundedGrandTotal - currentRoundedSum;
    if (diff !== 0) {
      const firstPayer = result.find(s => s.finalAmount > 0);
      if (firstPayer) {
        firstPayer.finalAmount += diff;
        firstPayer.roundingAdjustment += diff;
        firstPayer.items.push({ name: 'ส่วนต่างปัดเศษ (รับจบ)', cost: diff });
      }
    }
  }

  return result;
};