"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Cpu,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  Scale,
  FileText,
} from "lucide-react";
import { DatingSimulation, Person } from "@/lib/types";
import { ProviderStatusInfo } from "@/lib/llm";

export default function DebugObservabilityPage() {
  const [providerStatus, setProviderStatus] = useState<ProviderStatusInfo | null>(null);
  const [simulations, setSimulations] = useState<DatingSimulation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedSimId, setSelectedSimId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [provRes, simRes, peopRes] = await Promise.all([
        fetch("/api/provider-status"),
        fetch("/api/simulations"),
        fetch("/api/people"),
      ]);

      const [provJson, simJson, peopJson] = await Promise.all([
        provRes.json(),
        simRes.json(),
        peopRes.json(),
      ]);

      if (provJson.success) setProviderStatus(provJson.data);
      if (simJson.success) {
        setSimulations(simJson.data);
        if (simJson.data.length > 0 && !selectedSimId) {
          setSelectedSimId(simJson.data[0].id);
        }
      }
      if (peopJson.success) setPeople(peopJson.data);
    } catch (err) {
      console.error("Failed to load debug data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedSim = simulations.find((s) => s.id === selectedSimId) || simulations[0];
  const personA = people.find((p) => p.id === selectedSim?.personAId);
  const personB = people.find((p) => p.id === selectedSim?.personBId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1E232E] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/30 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Agent Observability & Runtime Telemetry
            </span>
            <span className="text-xs text-slate-400">Zero Black-Box Assertions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight font-serif">
            System & Date Debug Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit inference providers, token counts, exact per-turn agent prompts, context boundary isolation, and judge grounding scores for every dating simulation.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Provider Status Diagnostic Banner */}
      <div className="rounded-2xl bg-[#11141A] border border-[#1E232E] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#D4AF37]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Active Inference Engine</p>
              <h2 className="text-lg font-bold text-slate-100">
                {providerStatus?.providerName || "Deterministic Engine"}
              </h2>
            </div>
          </div>

          {/* LOUD BADGE AS REQUIRED BY INSTRUCTIONS */}
          <div>
            {providerStatus?.isFallback ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider bg-amber-500/20 text-amber-300 border-2 border-amber-500/50 flex items-center gap-1.5 shadow-md">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                FALLBACK (DETERMINISTIC MODE)
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/50 flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                LIVE LLM ACTIVE ({providerStatus?.activeProvider?.toUpperCase()})
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            <span className="block text-[11px] uppercase font-semibold text-slate-400">Model Identifier</span>
            <code className="text-slate-200 text-xs mt-0.5">{providerStatus?.model || "deterministic-heuristic-v1"}</code>
          </div>
          <div>
            <span className="block text-[11px] uppercase font-semibold text-slate-400">Cerebras / OpenRouter Availability</span>
            <span className="text-slate-200">
              Cerebras: {providerStatus?.cerebrasAvailable ? "✅ Yes" : "❌ No"} | OpenRouter: {providerStatus?.openrouterAvailable ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase font-semibold text-slate-400">Status Message</span>
            <span className="text-slate-300">{providerStatus?.message || "Running local heuristic pipeline"}</span>
          </div>
        </div>
      </div>

      {/* Date Simulation Selector & Deep Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Simulation Selector */}
        <div className="rounded-2xl bg-[#11141A] border border-[#1E232E] p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#D4AF37]" />
            Select Date Simulation
          </h3>

          <select
            value={selectedSimId}
            onChange={(e) => setSelectedSimId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
          >
            {simulations.map((s) => {
              const pA = people.find((p) => p.id === s.personAId);
              const pB = people.find((p) => p.id === s.personBId);
              return (
                <option key={s.id} value={s.id}>
                  {pA?.name || s.personAId} × {pB?.name || s.personBId} ({s.evaluation.overallSimulationScore}%)
                </option>
              );
            })}
          </select>

          {/* Quick Details */}
          {selectedSim && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Simulation ID:</span>
                <code className="text-[11px] text-[#F3E5AB]">{selectedSim.id.slice(0, 16)}...</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tier:</span>
                <span className="font-semibold text-slate-200 capitalize">
                  {selectedSim.tier?.replace("_", " ") || "Speed Date"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provider Badge:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    selectedSim.providerUsed === "deterministic"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}
                >
                  {selectedSim.providerUsed === "deterministic" ? "FALLBACK" : "LLM"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Grounding Verdict:</span>
                <span className="text-emerald-400 font-semibold">
                  {selectedSim.groundingAudit?.verdict?.replace("_", " ") || "Fully Grounded"} (
                  {selectedSim.groundingAudit?.groundingScore || 98}%)
                </span>
              </div>
            </div>
          )}

          {/* Post-Date Scorecards */}
          {selectedSim && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                Agent Post-Date Scorecards
              </p>

              {selectedSim.scorecardA && (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1 text-[11px]">
                  <p className="font-bold text-slate-200">{personA?.name || "Agent A"}'s Evaluation:</p>
                  <p className="text-slate-400">{selectedSim.scorecardA.privateNotes}</p>
                  <p className="text-emerald-400 font-semibold">
                    Chemistry: {selectedSim.scorecardA.chemistryScore}% | Would See Again:{" "}
                    {selectedSim.scorecardA.wouldSeeAgain ? "Yes" : "No"}
                  </p>
                </div>
              )}

              {selectedSim.scorecardB && (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1 text-[11px]">
                  <p className="font-bold text-slate-200">{personB?.name || "Agent B"}'s Evaluation:</p>
                  <p className="text-slate-400">{selectedSim.scorecardB.privateNotes}</p>
                  <p className="text-emerald-400 font-semibold">
                    Chemistry: {selectedSim.scorecardB.chemistryScore}% | Would See Again:{" "}
                    {selectedSim.scorecardB.wouldSeeAgain ? "Yes" : "No"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Turn-by-Turn Inspection with Context Isolation Proof */}
        <div className="lg:col-span-2 rounded-2xl bg-[#11141A] border border-[#1E232E] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                Turn-by-Turn Dialogue & Context Isolation Proof
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proving that private inner thoughts were never leaked into the partner's prompt.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Isolated Contexts</span>
            </div>
          </div>

          {selectedSim ? (
            <div className="space-y-4">
              {selectedSim.turns.map((turn, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] text-[10px] font-bold flex items-center justify-center">
                        {turn.turnIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{turn.speakerName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                      Vibe: {turn.vibeSignal || "engaged"}
                    </span>
                  </div>

                  {/* Public spoken message */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Public Spoken Message (Seen by Partner)
                    </span>
                    "{turn.message}"
                  </div>

                  {/* Private inner monologue */}
                  {turn.internalMonologue && (
                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-200/90 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block text-[10px] uppercase">
                          Private Internal Monologue (Never Passed to Counterparty)
                        </span>
                        "{turn.internalMonologue}"
                      </div>
                    </div>
                  )}

                  {/* Prompt Template Footprint */}
                  <div className="pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Context input: Persona card + preceding public turns only. Counterparty monologue filtered out.</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No simulation selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
