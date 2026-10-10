"use server";

import { requireUser } from "./requireUser";
import { billsDatabase } from "./db";
import { revalidatePath } from "next/cache";

export async function saveBillAction(newBill: any) {
  await requireUser(); // 🚨 ดักตรวจสิทธิ์ฝั่ง Server
  billsDatabase.unshift(newBill);
  revalidatePath("/");
}

export async function deleteBillAction(id: string) {
  await requireUser(); // ดักตรวจสิทธิ์ฝั่ง Server
  const index = billsDatabase.findIndex((b) => b.id === id);
  if (index > -1) billsDatabase.splice(index, 1);
  revalidatePath("/");
}