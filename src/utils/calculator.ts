import { Person, FoodItem, BillConfig, PersonSummary } from "../types";

export function calculateBill(persons: Person[], items: FoodItem[], config: BillConfig): PersonSummary[] {
  const summariesMap: { [personId: string]: { totalBeforeTax: number; items: { name: string; cost: number }[] } } = {};
  
  persons.forEach(p => {
    summariesMap[p.id] = { totalBeforeTax: 0, items: [] };
  });

  items.forEach(item => {
    if (!item.sharedBy || item.sharedBy.length === 0) return;
    const totalItemPrice = item.price * (item.quantity || 1);
    const costPerPerson = totalItemPrice / item.sharedBy.length;

    item.sharedBy.forEach(pId => {
      if (summariesMap[pId]) {
        summariesMap[pId].totalBeforeTax += costPerPerson;
        summariesMap[pId].items.push({
          name: `${item.name} (x${item.quantity})`,
          cost: costPerPerson
        });
      }
    });
  });

  const scRate = (config.serviceCharge || 0) / 100;
  const vatRate = (config.vat || 0) / 100;

  return persons.map((person) => {
    const data = summariesMap[person.id] || { totalBeforeTax: 0, items: [] };
    const subtotal = data.totalBeforeTax;
    const scAmount = subtotal * scRate;
    const withSc = subtotal + scAmount;
    const vatAmount = withSc * vatRate;
    let finalAmount = withSc + vatAmount;

    // 🌟 ปัดขึ้นเสมอ (Always Round Up)
    if (config.rounding === "whole") {
      finalAmount = Math.ceil(finalAmount);
    }

    return {
      person,
      totalBeforeTax: subtotal,
      finalAmount,
      items: data.items
    } as PersonSummary;
  });
}