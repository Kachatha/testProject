export interface Person {
  id: string;
  name: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sharedBy: string[];
}

export interface BillConfig {
  promptPay: string;
  vat: number;
  serviceCharge: number;
  rounding: "none" | "whole"; // เปลี่ยนให้เหลือแค่ "ไม่ปัดเศษ" กับ "ปัดเป็นจำนวนเต็ม"
}

export interface PersonSummary {
  person: Person;
  totalBeforeTax: number;
  totalWithTax: number;
  finalAmount: number; 
  roundingAdjustment: number; 
  items: { name: string; cost: number }[];
}

export interface BillHistoryItem {
  id: string;
  date: string;
  title: string;
  grandTotal: number;
  summaries: PersonSummary[];
}