import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Pairwise AI — Agentic Dating Platform",
  description: "LLM-powered agentic dating simulations, individual profile analysis, and explainable hybrid matching intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090B0E] text-slate-100">
        <Suspense fallback={<div className="h-16 border-b border-[#1E232E] bg-[#090B0E]" />}>
          <Navigation />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-[#1E232E] py-6 text-center text-xs text-slate-400 bg-[#090B0E]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">PAIRWISE AI</span>
              <span>— Grounded Agentic Dating Intelligence</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Inference priority: Cerebras → OpenRouter → Deterministic Fallback. Algorithmic scores are exploratory indicators.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
