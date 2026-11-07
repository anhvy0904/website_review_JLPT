"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  BarChart3,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  Layers,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/exams", label: "Kho đề thi", icon: Compass },
    { href: "/learn", label: "Học chuyên đề", icon: Layers },
    { href: "/flashcards", label: "Flashcard", icon: Sparkles },
    { href: "/review", label: "Ôn câu sai", icon: RotateCcw },
    { href: "/dashboard", label: "Thống kê", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#A5D6A7]/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] border-2 border-[#A5D6A7] overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
            <img
              src="/images/mascot-frog.jpg"
              alt="Mascot Ếch VuyAnh"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-[#1B5E20] tracking-tight flex items-center gap-1">
                Luyện đề tiếng Nhật cùng VuyAnh <span className="text-sm">🌸</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                N3
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 hidden sm:block">
              Góc nhỏ luyện đề thân thương cho ngừi iu
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#E8F5E9] text-[#1B5E20] font-semibold border border-[#A5D6A7]/70"
                    : "text-slate-600 hover:text-[#1B5E20] hover:bg-[#E8F5E9]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2E7D32]" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/exams"
            className="ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:bg-[#2E7D32] border border-[#66BB6A]/40 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#A5D6A7]" />
            Luyện đề ngay
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-[#1B5E20] hover:bg-[#E8F5E9]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#A5D6A7]/50 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-[#E8F5E9] text-[#1B5E20] font-semibold"
                    : "text-slate-600 hover:text-[#1B5E20] hover:bg-[#E8F5E9]/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2">
            <Link
              href="/exams"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#A5D6A7]" />
              Luyện đề ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
