"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Person, DatingSimulation } from "@/lib/types";
import { SimulationViewer } from "@/components/SimulationViewer";
import {
  HeartHandshake,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
} from "lucide-react";

function SimulateContent() {
  const searchParams = useSearchParams();
  const paramPersonA = searchParams.get("personA") || searchParams.get("subject") || "";
  const paramPersonB = searchParams.get("personB") || "";
  const paramSimId = searchParams.get("simId") || "";

  const [people, setPeople] = useState<Person[]>([]);
  const [personAId, setPersonAId] = useState<string>("");
  const [personBId, setPersonBId] = useState<string>("");
  const [turnsCount, setTurnsCount] = useState<number>(6);
  const [simulation, setSimulation] = useState<DatingSimulation | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial people
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/people");
        const json = await res.json();
        if (json.success && json.data.length >= 2) {
          setPeople(json.data);

          // Setup initial selection
          const defaultA = paramPersonA || json.data[0].id;
          let defaultB = paramPersonB;
          if (!defaultB || defaultB === defaultA) {
            defaultB = json.data.find((p: Person) => p.id !== defaultA)?.id || json.data[1].id;
          }

          setPersonAId(defaultA);
          setPersonBId(defaultB);

          // If simId provided, fetch that simulation directly
          if (paramSimId) {
            const simRes = await fetch(`/api/simulations/${paramSimId}`);
            const simJson = await simRes.json();
            if (simJson.success) {
              setSimulation(simJson.data);
              setPersonAId(simJson.data.personAId);
              setPersonBId(simJson.data.personBId);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load people", err);
      }
    }
    load();
  }, [paramPersonA, paramPersonB, paramSimId]);

  const runSimulation = async (forceFresh: boolean = false) => {
    if (!personAId || !personBId) return;
    if (personAId === personBId) {
      setError("Please select two distinct individuals for the simulation.");
      return;
    }

    setSimulating(true);
    setError(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId,
          personBId,
          turnsCount,
          forceFresh,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Simulation failed");
      }

      setSimulation(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const personA = people.find((p) => p.id === personAId) || null;
  const personB = people.find((p) => p.id === personBId) || null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
            Dating Simulation Theater
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Orchestrate an authentic, multi-turn conversational date between two autonomous agents.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Setup Box */}
      <div className="card-luxury rounded-3xl p-6 sm:p-8 border-[#D4AF37]/30 bg-gradient-to-br from-[#11141A] via-[#0E1117] to-[#0A0D12]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Participant A */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Agent 01 (First Speaker)
            </label>
            <select
              value={personAId}
              onChange={(e) => setPersonAId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === personBId}>
                  {p.name} ({p.company})
                </option>
              ))}
            </select>

            {personA && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <img
                  src={personA.avatarUrl}
                  alt={personA.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate">{personA.role}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Interests: {personA.interests.slice(0, 2).join(", ")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Participant B */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Agent 02 (Counterpart)
            </label>
            <select
              value={personBId}
              onChange={(e) => setPersonBId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === personAId}>
                  {p.name} ({p.company})
                </option>
              ))}
            </select>

            {personB && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <img
                  src={personB.avatarUrl}
                  alt={personB.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate">{personB.role}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Interests: {personB.interests.slice(0, 2).join(", ")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-6 border-t border-[#1E232E] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-2">
              <span className="text-slate-400">Dialogue Depth:</span>
              <select
                value={turnsCount}
                onChange={(e) => setTurnsCount(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none"
              >
                <option value={4}>4 Turns (Quick Check)</option>
                <option value={6}>6 Turns (Standard Date)</option>
                <option value={8}>8 Turns (Deep Conversation)</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runSimulation(true)}
              disabled={simulating}
              className="px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} />
              <span>Force Re-simulate</span>
            </button>

            <button
              onClick={() => runSimulation(false)}
              disabled={simulating}
              className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Multi-Turn Date...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{simulation ? "Simulate Again" : "Start Date Simulation"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Display */}
      {simulation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-200">Simulation Transcript & Grounded Verdict</h2>
            {personA && personB && (
              <Link
                href={`/match/${personA.id}/${personB.id}`}
                className="inline-flex items-center gap-1 text-xs text-[#F3E5AB] font-semibold hover:underline"
              >
                <span>Inspect Full Match Breakdown & Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <SimulationViewer
            simulation={simulation}
            personA={personA}
            personB={personB}
          />
        </div>
      )}
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading Theater...</div>}>
      <SimulateContent />
    </Suspense>
  );
}
