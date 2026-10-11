"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, HeartHandshake, BookOpen, Trophy, UserPlus, Home, Sparkles } from "lucide-react";
import { ProviderBadge } from "./ProviderBadge";
import { SettingsModal } from "./SettingsModal";

export function Navigation() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/directory", label: "Directory", icon: Users },
    { href: "/simulate", label: "Simulate Date", icon: HeartHandshake },
    { href: "/transcripts", label: "Transcripts", icon: BookOpen },
    { href: "/rankings", label: "Rankings", icon: Trophy },
    { href: "/add", label: "Add Person", icon: UserPlus },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1E232E] bg-[#090B0E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#090B0E]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-100 font-serif">
                  PAIRWISE
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40">
                  AI
                </span>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-slate-400 font-medium hidden sm:block">
                Agentic Dating Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#1E232E] text-[#F3E5AB] border border-[#D4AF37]/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Provider Status Indicator */}
          <div className="flex items-center gap-3">
            <ProviderBadge onOpenSettings={() => setSettingsOpen(true)} />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 px-2 border-t border-[#1E232E]/60 bg-[#090B0E]/95 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-[10px] font-medium transition-all shrink-0 ${
                  isActive ? "text-[#F3E5AB]" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
