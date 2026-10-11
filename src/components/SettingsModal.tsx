"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Cpu, Key, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { ProviderStatusInfo } from "@/lib/llm";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [status, setStatus] = useState<ProviderStatusInfo | null>(null);
  const [cerebrasKeyInput, setCerebrasKeyInput] = useState("");
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState("");
  const [apifyTokenInput, setApifyTokenInput] = useState("");
  const [forcedMode, setForcedMode] = useState<"auto" | "cerebras" | "openrouter" | "deterministic">("auto");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/provider-status");
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const payload: any = {};
      if (cerebrasKeyInput.trim()) payload.cerebrasKey = cerebrasKeyInput.trim();
      if (openrouterKeyInput.trim()) payload.openrouterKey = openrouterKeyInput.trim();
      if (apifyTokenInput.trim()) payload.apifyToken = apifyTokenInput.trim();

      if (forcedMode === "auto") {
        payload.forcedProvider = null;
      } else {
        payload.forcedProvider = forcedMode;
      }

      const res = await fetch("/api/provider-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
        setNotice("Configuration updated successfully.");
        setCerebrasKeyInput("");
        setOpenrouterKeyInput("");
        setApifyTokenInput("");
      } else {
        setNotice(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setNotice(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/provider-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
        setForcedMode("auto");
        setNotice("Reset to environment defaults.");
      }
    } catch (err: any) {
      setNotice(`Reset failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#11141A] border border-[#1E232E] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Inference Provider Engine</h2>
            <p className="text-xs text-slate-400">
              Provider Abstraction Architecture: Cerebras → OpenRouter → Deterministic Fallback
            </p>
          </div>
        </div>

        {/* Current Status Box */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Provider State
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                status?.isFallback
                  ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                  : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
              }`}
            >
              {status?.isFallback ? "Deterministic Mode (Offline Safe)" : "Live Cloud LLM Mode"}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-200">{status?.providerName}</p>
          <p className="text-xs text-slate-400 mt-1">Model: <code className="text-[#F3E5AB]">{status?.model}</code></p>
          <p className="text-xs text-slate-400 mt-1">{status?.message}</p>
        </div>

        {notice && (
          <div className="mb-4 p-3 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-200">
            {notice}
          </div>
        )}

        {/* Engine mode selector */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Operating Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "auto", label: "Auto Cascade" },
                { id: "cerebras", label: "Cerebras" },
                { id: "openrouter", label: "OpenRouter" },
                { id: "deterministic", label: "Deterministic" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setForcedMode(mode.id as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    forcedMode === mode.id
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3E5AB]"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Cerebras API Key (Session-Only)
            </label>
            <input
              type="password"
              placeholder="csk-..."
              value={cerebrasKeyInput}
              onChange={(e) => setCerebrasKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Stored only in server process memory. Never checked into Git or exposed to client browsers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional OpenRouter API Key (Session-Only)
            </label>
            <input
              type="password"
              placeholder="sk-or-..."
              value={openrouterKeyInput}
              onChange={(e) => setOpenrouterKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Apify API Token (for Live Actor Scrapes)
            </label>
            <input
              type="password"
              placeholder="apify_api_... (Actor: FcwQfZYY4FHN6baby)"
              value={apifyTokenInput}
              onChange={(e) => setApifyTokenInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Power live profile extraction. If omitted, uses the high-fidelity snapshot cache.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            disabled={saving}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Reset Overrides
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="gold-button px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
              Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
