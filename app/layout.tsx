import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Luyện đề tiếng Nhật cùng VuyAnh 🌸 — Nền Tảng Luyện Đề JLPT N3",
  description:
    "Nền tảng luyện thi JLPT N3 trực tuyến chuyên sâu: Từ vựng, Chữ Hán, Ngữ pháp và Đọc hiểu với lời giải chi tiết 100% tiếng Việt, phân tích cặn kẽ từng lựa chọn và bài đọc song ngữ.",
  icons: {
    icon: "/images/mascot-frog.jpg",
    apple: "/images/mascot-frog.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/images/mascot-frog.jpg" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fbfdfb] text-slate-800 antialiased selection:bg-[#A5D6A7]/50 selection:text-[#1B5E20]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
