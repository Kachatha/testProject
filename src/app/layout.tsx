import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SHAREKUB - Smart Bill Splitter",
  description: "หารบิลกับเพื่อนรายคน โดยไม่จำเป็นต้องใช้เครื่องคิดเลข",
};

export default function RootLayout({
  children,}: 
{
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={jakarta.variable}>
      <body className="font-sans antialiased bg-[#05070f] text-slate-100 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}