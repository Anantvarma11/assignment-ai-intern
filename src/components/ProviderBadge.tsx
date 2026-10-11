"use client";

import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { ProviderStatusInfo } from "@/lib/llm";

interface ProviderBadgeProps {
  onOpenSettings?: () => void;
}

export function ProviderBadge({ onOpenSettings }: ProviderBadgeProps) {
  const [status, setStatus] = useState<ProviderStatusInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/provider-status");
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
      }
    } catch (err) {
      console.error("Failed to load provider status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status periodically
    const timer = setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-400">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Connecting engine...</span>
      </div>
    );
  }

  const isCerebras = status.activeProvider === "cerebras";
  const isOpenRouter = status.activeProvider === "openrouter";
  const isFallback = status.isFallback;

  return (
    <button
      onClick={onOpenSettings}
      title="Click to view inference engine diagnostics & API settings"
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        isCerebras
          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
          : isOpenRouter
          ? "bg-blue-950/40 border-blue-500/40 text-blue-300 hover:border-blue-400"
          : "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isFallback ? "bg-amber-400" : isCerebras ? "bg-emerald-400" : "bg-blue-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isFallback ? "bg-amber-500" : isCerebras ? "bg-emerald-500" : "bg-blue-500"
          }`}
        />
      </span>

      <span className="font-semibold uppercase tracking-wider text-[10px]">
        {isCerebras ? "CEREBRAS" : isOpenRouter ? "OPENROUTER" : "FALLBACK"}
      </span>

      <span className="text-slate-400 hidden sm:inline">|</span>
      <span className="text-slate-300 font-mono text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
        {status.model}
      </span>

      <span className="text-slate-400 group-hover:text-slate-200 transition-colors ml-1 text-[10px]">
        ⚙️
      </span>
    </button>
  );
}
