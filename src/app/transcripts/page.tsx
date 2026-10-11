"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DatingSimulation } from "@/lib/types";
import { BookOpen, Search, Sparkles, MapPin, Calendar, HeartHandshake, ArrowRight } from "lucide-react";

export default function TranscriptsPage() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchSimulations() {
      try {
        const res = await fetch("/api/simulations");
        const json = await res.json();
        if (json.success) {
          setSimulations(json.data);
        }
      } catch (err) {
        console.error("Failed to load transcripts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimulations();
  }, []);

  const filtered = simulations.filter((sim) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sim.personA?.name.toLowerCase().includes(q) ||
      sim.personB?.name.toLowerCase().includes(q) ||
      sim.venue.name.toLowerCase().includes(q) ||
      sim.providerUsed.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1E232E]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
              Simulation Transcripts Archive
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Permanent record of completed agent-to-agent dates with full turn-by-turn dialogue and evaluations.
          </p>
        </div>

        <Link
          href="/simulate"
          className="gold-button px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>New Simulation</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter transcripts by participant or venue name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      {/* Transcripts List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading transcript archive...</div>
      ) : filtered.length === 0 ? (
        <div className="card-luxury rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm">No recorded simulations found.</p>
          <Link
            href="/simulate"
            className="inline-block mt-3 text-xs text-[#F3E5AB] hover:underline"
          >
            Launch a simulation now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sim) => (
            <div
              key={sim.id}
              className="card-luxury rounded-2xl p-6 transition-all hover:border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex -space-x-3 shrink-0">
                  <img
                    src={sim.personA?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                    alt={sim.personA?.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#11141A]"
                  />
                  <img
                    src={sim.personB?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                    alt={sim.personB?.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#11141A]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {sim.personA?.name} & {sim.personB?.name}
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {sim.providerUsed}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      <span>{sim.venue.name}</span>
                    </span>
                    <span>•</span>
                    <span>{sim.turns.length} turns recorded</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 mt-2 italic">
                    &quot;{sim.evaluation.narrativeSummary}&quot;
                  </p>
                </div>
              </div>

              {/* Right: Score & CTA */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#1E232E] pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Chemistry</div>
                  <div className="text-xl font-bold font-mono text-[#F3E5AB]">
                    {sim.evaluation.overallSimulationScore}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/simulate?simId=${sim.id}`}
                    className="gold-button px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {sim.personA && sim.personB && (
                    <Link
                      href={`/match/${sim.personA.id}/${sim.personB.id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                      title="Inspect Bilateral Match"
                    >
                      Match
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
