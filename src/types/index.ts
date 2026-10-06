export interface Person {
  id: string;
  name: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  quantity: number; //
  sharedBy: string[]; // เก็บ id ของ Person ที่กินเมนูนี้
}

export interface BillConfig {
  promptPay: string;
  vat: number;
  serviceCharge: number; 
  rounding: 'none' | 'tens' | 'hundreds'; // ไม่ปัด, ปัดหลักสิบ, ปัดหลักร้อย
}

export interface PersonSummary {
  person: Person;
  totalBeforeTax: number;
  totalWithTax: number;
  finalAmount: number; // ยอดสุทธิหลังปัดเศษ
  items: { name: string; cost: number }[];
}

export interface BillHistoryItem {
  id: string;
  date: string;
  title: string;
  grandTotal: number;
  summaries: PersonSummary[];
}

export interface FavoriteMenu {
  id: string;
  name: string;
  price: number;
}

export interface FavoriteShop {
  id: string;
  name: string;
  menus: FavoriteMenu[]; // เก็บรายการอาหารโปรดภายในร้านนั้นๆ
}