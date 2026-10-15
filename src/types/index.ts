{/*ประกาศโครงสร้างคน*/}
export interface Person {
  id: string;
  name: string;
}

{/*ประกาศโครงสร้างรายการอาหาร*/}
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sharedBy: string[]; /*Arrayเก็บidของคนกลุ่มที่กินเมนูนี้*/
}

{/*ประกาศที่เก็บการตั้งค่าบิล*/}
export interface BillConfig {
  promptPay: string; /*เบอร์โทรศัพท์ เลขบัตรประจำตัวประชาชน*/
  vat: number;
  serviceCharge: number;
  rounding: "none" | "whole"; 
}

{/*ประกาศโครงสร้างของผลลัพธ์*/}
export interface PersonSummary {
  person: Person;
  totalBeforeTax: number;
  totalWithTax: number;
  finalAmount: number; 
  roundingAdjustment: number; 
  items: { name: string; cost: number }[]; /*รายการที่แต่ละคนต้องรับผิดชอบ และ ราคาที่ต้องจ่าย*/
}

{/*ประกาศโครงสร้างประวัติ*/}
export interface BillHistoryItem {
  id: string;
  date: string;
  title: string;
  grandTotal: number;
  summaries: PersonSummary[];/*ข้อมูลสรุปยอดชำระรายบุคคล*/
}