import type { Metadata } from "next";
import { Inter } from "next/font/google";
// 🚨 เช็กบรรทัดนี้ด่วน! ต้องมีบรรทัดนี้เพื่อดึง CSS ไปใช้ทั้งเว็บ
import "./globals.css"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sharekub App",
  description: "ระบบคำนวณบิลหารค่าอาหาร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-[#f4f5f7] text-gray-900 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
