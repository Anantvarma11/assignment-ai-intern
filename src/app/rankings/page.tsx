"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Person, CompatibilityMatch } from "@/lib/types";
import {
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  ArrowRightLeft,
  ExternalLink,
  LayoutGrid,
} from "lucide-react";

function RankingsContent() {
  const searchParams = useSearchParams();
  const paramSubject = searchParams.get("subject") || "";

  const [people, setPeople] = useState<Person[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [subject, setSubject] = useState<Person | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all people first
  useEffect(() => {
    async function loadPeople() {
      try {
        const res = await fetch("/api/people");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setPeople(json.data);
          const initial = paramSubject || json.data[0].id;
          setSubjectId(initial);
        }
      } catch (err) {
        console.error("Failed to load people", err);
      }
    }
    loadPeople();
  }, [paramSubject]);

  // Load rankings whenever subjectId changes
  useEffect(() => {
    async function loadRankings() {
      if (!subjectId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/rankings/${subjectId}`);
        const json = await res.json();
        if (json.success) {
          setSubject(json.subject);
          setRankings(json.data);
        }
      } catch (err) {
        console.error("Failed to load rankings", err);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [subjectId]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1E232E]">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
              Personalized Compatibility Rankings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Directional and mutual compatibility calculated across all 26 real creators with grounded evidence.
          </p>
        </div>

        <Link
          href="/heatmap"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-bold transition-all shadow-sm"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF37]" />
          View 26×26 Heatmap Matrix
        </Link>
      </div>

      {/* Subject Picker Card */}
      <div className="card-luxury rounded-2xl p-6 border-[#D4AF37]/30 bg-gradient-to-br from-[#11141A] to-[#0A0D12]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            {subject && (
              <img
                src={subject.avatarUrl}
                alt={subject.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-md shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                View Rankings For Individual:
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full sm:w-auto min-w-[280px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-[#D4AF37]"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.role} ({p.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {subject && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link
                href={`/person/${subject.id}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                View Full Profile
              </Link>
              <Link
                href={`/agent/${subject.id}`}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37]/25 transition-colors"
              >
                Agent Persona
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Computing hybrid rankings & evidence...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Ranked candidates for <strong className="text-slate-200">{subject?.name}</strong> ({rankings.length} total)
            </span>
            <span className="text-[11px] text-[#F3E5AB]">Sorted by Mutual Compatibility</span>
          </div>

          <div className="space-y-3">
            {rankings.map((item, index) => {
              const { candidate, match, simulation } = item;
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={candidate.id}
                  className={`card-luxury rounded-2xl p-5 transition-all duration-200 hover:border-[#D4AF37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                    isTop3 ? "border-[#D4AF37]/25 bg-gradient-to-r from-[#11141A] to-[#141822]" : ""
                  }`}
                >
                  {/* Left: Rank, Avatar, Name & Signals */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 border ${
                        rank === 1
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#F3E5AB]"
                          : rank === 2
                          ? "bg-slate-300/15 border-slate-400 text-slate-200"
                          : rank === 3
                          ? "bg-amber-800/20 border-amber-700 text-amber-300"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      #{rank}
                    </div>

                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#1E232E] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/person/${candidate.id}`}
                          className="text-base font-bold text-slate-100 hover:text-[#F3E5AB] transition-colors truncate"
                        >
                          {candidate.name}
                        </Link>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-xs text-slate-400 truncate">
                          • {candidate.role} ({candidate.company})
                        </span>
                      </div>

                      {/* Evidence statement snippet */}
                      <p className="text-xs text-slate-300 line-clamp-1 mt-1">
                        {match.evidenceStatements[0]}
                      </p>

                      {/* Shared Interests badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {match.sharedInterestsList.slice(0, 3).map((interest: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {interest}
                          </span>
                        ))}
                        {match.sharedHobbiesList.slice(0, 2).map((hobby: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#F3E5AB]"
                          >
                            ☕ {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#1E232E] pt-3 md:pt-0">
                    {/* Directional breakdown */}
                    <div className="text-right text-xs">
                      <div className="flex items-center gap-2 justify-end text-[11px] text-slate-400 font-mono">
                        <span>A→B: {match.directionalCompatibility.subjectToCandidate}%</span>
                        <span>•</span>
                        <span>B→A: {match.directionalCompatibility.candidateToSubject}%</span>
                      </div>
                      <div className="text-xl font-black font-mono text-[#F3E5AB] mt-0.5">
                        {match.mutualCompatibility}%
                        <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">
                          Mutual
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/match/${subject?.id}/${candidate.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <span>Evidence</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      <Link
                        href={`/simulate?personA=${subject?.id}&personB=${candidate.id}`}
                        className="gold-button px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                        title="Simulate Date Between Pair"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Date</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading Rankings...</div>}>
      <RankingsContent />
    </Suspense>
  );
}
