"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Person, DatingSimulation, CompatibilityMatch } from "@/lib/types";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import {
  Sparkles,
  HeartHandshake,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

function MatchDetailContent() {
  const params = useParams();
  const idA = params?.idA as string;
  const idB = params?.idB as string;

  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [match, setMatch] = useState<CompatibilityMatch | null>(null);
  const [simulation, setSimulation] = useState<DatingSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatch() {
      if (!idA || !idB) return;
      try {
        const res = await fetch(`/api/match/${idA}/${idB}`);
        const json = await res.json();
        if (json.success) {
          setPersonA(json.personA);
          setPersonB(json.personB);
          setMatch(json.match);
          setSimulation(json.simulation);
        } else {
          setError(json.error || "Match analysis unavailable");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [idA, idB]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Synthesizing match evidence...</div>;
  }

  if (error || !personA || !personB || !match) {
    return (
      <div className="card-luxury rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Match Detail Unavailable</h2>
        <p className="text-xs text-slate-400">{error || "Could not analyze the requested pair."}</p>
        <Link href="/rankings" className="text-xs text-[#F3E5AB] hover:underline">
          Return to Rankings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href={`/rankings?subject=${personA.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {personA.name}&apos;s Rankings</span>
      </Link>

      {/* Head to Head Comparison Header */}
      <div className="card-luxury rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#11141A] via-[#0E1117] to-[#0A0D12] border-[#D4AF37]/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Person A */}
          <div className="flex items-center gap-4 flex-1">
            <img
              src={personA.avatarUrl}
              alt={personA.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
              }}
            />
            <div className="min-w-0">
              <Link
                href={`/person/${personA.id}`}
                className="text-lg font-bold text-slate-100 hover:text-[#F3E5AB] transition-colors"
              >
                {personA.name}
              </Link>
              <div className="text-xs text-slate-400 truncate">{personA.role}</div>
              <div className="text-[11px] text-slate-400 truncate">{personA.company}</div>
            </div>
          </div>

          {/* Central Heart / VS badge */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#8C6D1F]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F3E5AB]">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest mt-1">
              Bilateral Fit
            </span>
          </div>

          {/* Person B */}
          <div className="flex items-center gap-4 flex-1 justify-end text-right">
            <div className="min-w-0">
              <Link
                href={`/person/${personB.id}`}
                className="text-lg font-bold text-slate-100 hover:text-[#F3E5AB] transition-colors"
              >
                {personB.name}
              </Link>
              <div className="text-xs text-slate-400 truncate">{personB.role}</div>
              <div className="text-[11px] text-slate-400 truncate">{personB.company}</div>
            </div>
            <img
              src={personB.avatarUrl}
              alt={personB.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";
              }}
            />
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-6 pt-6 border-t border-[#1E232E] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {simulation ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Live Date Simulation Recorded ({simulation.turns.length} turns)
              </span>
            ) : (
              <span className="text-amber-400">
                Projected Interaction. No live date simulation run yet.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {simulation && (
              <Link
                href={`/simulate?simId=${simulation.id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Read Transcript</span>
              </Link>
            )}

            <Link
              href={`/simulate?personA=${personA.id}&personB=${personB.id}`}
              className="gold-button px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{simulation ? "Re-Simulate Date" : "Simulate Date Now"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Comprehensive Score Breakdown & Grounded Evidence */}
      <ScoreBreakdown
        match={match}
        subject={personA}
        candidate={personB}
      />
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Synthesizing match evidence...</div>}>
      <MatchDetailContent />
    </Suspense>
  );
}
