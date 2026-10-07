import { Person, FoodItem, BillConfig, PersonSummary } from '../types';

export const calculateBill = (
  persons: Person[],
  items: FoodItem[],
  config: BillConfig
): PersonSummary[] => {
  let summaries: Record<string, PersonSummary> = {};
  persons.forEach(p => {
    summaries[p.id] = {
      person: p,
      totalBeforeTax: 0,
      totalWithTax: 0,
      finalAmount: 0,
      roundingAdjustment: 0,
      items: [],
    };
  });

  items.forEach(item => {
    if (item.sharedBy.length > 0) {
      const totalPrice = item.price * (item.quantity || 1);
      const splitPrice = totalPrice / item.sharedBy.length;
      
      item.sharedBy.forEach(personId => {
        if (summaries[personId]) {
          summaries[personId].totalBeforeTax += splitPrice;
          summaries[personId].items.push({
            name: `${item.name} x${item.quantity || 1}`,
            cost: splitPrice
          });
        }
      });
    }
  });

  return Object.values(summaries).map(summary => {
    let currentTotal = summary.totalBeforeTax;

    if (config.serviceCharge > 0) {
      currentTotal += currentTotal * (config.serviceCharge / 100);
    }

    if (config.vat > 0) {
      currentTotal += currentTotal * (config.vat / 100);
    }

    summary.totalWithTax = currentTotal;

    // 🌟 ปรับวิธีปัดเศษให้ยุติธรรมขึ้น (ใช้ Math.round ปัดเศษใกล้เคียง)
    let finalAmt = currentTotal;
    if (config.rounding === 'tens') {
      finalAmt = Math.round(currentTotal / 10) * 10; // ปัดเป็นหลักสิบใกล้เคียง
    } else if (config.rounding === 'hundreds') {
      finalAmt = Math.round(currentTotal / 100) * 100; // ปัดเป็นหลักร้อยใกล้เคียง
    }

    summary.roundingAdjustment = finalAmt - currentTotal; // คำนวณส่วนต่าง (+ หรือ -)
    summary.finalAmount = finalAmt;
    return summary;
  });
};